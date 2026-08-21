// The gated page itself. Nothing is served until the request carries a valid
// Supabase session AND that user holds a live grant (lib/cv-gate).
//
// The stored presentation.html is never edited. Two serve-time rewrites make it
// work under the gated path:
//   1. <base href="/w/<slug>/"> so its relative assets/deck/* paths resolve here
//   2. the Google Fonts <link>s are swapped for the self-hosted copy, so the page
//      makes no third-party request (which would also leak a referrer)
import { type NextRequest, NextResponse } from "next/server";
import {
  applyCookies,
  gateHeaders,
  hasGrant,
  loginPage,
  notFound,
  recordView,
  requireViewer,
  sessionClient,
  slugMatches,
  storageFetch,
} from "@/lib/cv-gate";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

function prepare(raw: string, base: string): string {
  const usesGoogleFonts = /fonts\.(?:googleapis|gstatic)\.com/i.test(raw);
  let html = raw.replace(/[ \t]*<link\b[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\r?\n?/gi, "");
  const inject =
    `<base href="${base}">` +
    (usesGoogleFonts ? `\n<link rel="stylesheet" href="assets/fonts/fonts.css">` : "");
  return html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n${inject}`);
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!slugMatches(slug)) return notFound();

  const viewer = await requireViewer(req);
  if (!viewer.ok) return applyCookies(loginPage(`/w/${slug}`), viewer.jar);

  const upstream = await storageFetch("presentation.html");
  if (!upstream.ok) {
    return applyCookies(
      new NextResponse("Unavailable", { status: 502, headers: gateHeaders({ "Content-Type": "text/plain" }) }),
      viewer.jar,
    );
  }
  const html = prepare(await upstream.text(), `/w/${slug}/`);
  void recordView(viewer.userId);

  return applyCookies(
    new NextResponse(html, {
      status: 200,
      headers: gateHeaders({ "Content-Type": "text/html; charset=utf-8" }),
    }),
    viewer.jar,
  );
}

// Answer HEAD without touching Storage, so `curl -I` is cheap and still honest
// about the status code (401 when not authorised, 200 when it is).
export async function HEAD(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!slugMatches(slug)) return new NextResponse(null, { status: 404, headers: gateHeaders() });
  const viewer = await requireViewer(req);
  const headers = gateHeaders({ "Content-Type": "text/html; charset=utf-8" });
  return applyCookies(new NextResponse(null, { status: viewer.ok ? 200 : 401, headers }), viewer.jar);
}

// Sign-in. Server-side only: the form posts here, we exchange the credentials
// for a session, then confirm the grant. Failure is always the same generic
// message, so this cannot be used to discover which emails have accounts or
// which accounts have access.
export async function POST(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  if (!slugMatches(slug)) return notFound();

  // Reject a cross-site form post (login CSRF). Checked only when Origin is
  // present: this page sends Referrer-Policy: no-referrer, so demanding a
  // same-origin header outright could lock out a legitimate sign-in, while a
  // genuine cross-site post always carries a mismatched Origin.
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return notFound();

  if (!(await rateLimit(`cv-signin:${clientIp(req)}`, 10, 600))) {
    return loginPage(`/w/${slug}`, "Too many attempts. Try again later.");
  }

  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return loginPage(`/w/${slug}`, "Sign-in failed.");

  const { supabase, jar } = sessionClient(req);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return applyCookies(loginPage(`/w/${slug}`, "Sign-in failed."), jar);

  if (!(await hasGrant(data.user.id))) {
    // Correct password, no grant (e.g. any TABOR app account). Drop the session
    // rather than leave one lying around, and say nothing specific.
    await supabase.auth.signOut();
    return applyCookies(loginPage(`/w/${slug}`, "Sign-in failed."), jar);
  }

  return applyCookies(
    NextResponse.redirect(new URL(`/w/${slug}`, req.nextUrl.origin), { status: 303, headers: gateHeaders() }),
    jar,
  );
}
