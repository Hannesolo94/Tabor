// Every image, video and font the page loads comes through here, behind exactly
// the same check as the page. This is the half that is usually left open: if the
// deck were fetchable without auth, gating the HTML would be decoration.
//
// Range requests are forwarded to Storage so video seeks instead of downloading
// the whole file before it plays.
import { type NextRequest, NextResponse } from "next/server";
import { applyCookies, gateHeaders, notFound, requireViewer, slugMatches, storageFetch } from "@/lib/cv-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string; path: string[] }> };

// Exactly two folders, one flat filename, no traversal, no listing. Anything
// else (including a bare "deck/") is a 404.
const ALLOWED = /^(?:deck|fonts)\/[A-Za-z0-9][A-Za-z0-9._-]*\.[A-Za-z0-9]{2,5}$/;

const PASS_THROUGH = ["content-type", "content-length", "content-range", "etag", "last-modified"];

async function serve(req: NextRequest, ctx: Ctx, method: "GET" | "HEAD") {
  const { slug, path } = await ctx.params;
  if (!slugMatches(slug)) return notFound();

  const viewer = await requireViewer(req);
  if (!viewer.ok) {
    return applyCookies(
      new NextResponse(method === "HEAD" ? null : "Unauthorized", {
        status: 401,
        headers: gateHeaders({ "Content-Type": "text/plain; charset=utf-8" }),
      }),
      viewer.jar,
    );
  }

  const rel = (path ?? []).join("/");
  if (!ALLOWED.test(rel)) return notFound();

  const range = req.headers.get("range");
  const upstream = await storageFetch(`assets/${rel}`, {
    range,
    ifNoneMatch: req.headers.get("if-none-match"),
    // Ask Storage for a single byte on HEAD: it costs nothing and still reports
    // the real total size in Content-Range.
    ...(method === "HEAD" && !range ? { range: "bytes=0-0" } : {}),
  });

  if (upstream.status === 404) return notFound();
  if (upstream.status >= 400 && upstream.status !== 416) {
    return applyCookies(
      new NextResponse(method === "HEAD" ? null : "Unavailable", {
        status: 502,
        headers: gateHeaders({ "Content-Type": "text/plain" }),
      }),
      viewer.jar,
    );
  }

  const headers = gateHeaders();
  for (const key of PASS_THROUGH) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Disposition", "inline");
  // "private" keeps it out of the Vercel edge cache and any shared proxy; the
  // short max-age is what makes seeking around a video feel normal.
  headers.set("Cache-Control", "private, max-age=300");

  let status = upstream.status;
  let body: ReadableStream<Uint8Array> | null = upstream.body;
  if (method === "HEAD") {
    body = null;
    void upstream.body?.cancel();
    if (!range) {
      // Report the full size, not the 1-byte probe.
      const total = upstream.headers.get("content-range")?.split("/")[1];
      headers.delete("content-range");
      if (total) headers.set("Content-Length", total);
      status = 200;
    }
  }

  return applyCookies(new NextResponse(body, { status, headers }), viewer.jar);
}

export const GET = (req: NextRequest, ctx: Ctx) => serve(req, ctx, "GET");
export const HEAD = (req: NextRequest, ctx: Ctx) => serve(req, ctx, "HEAD");
