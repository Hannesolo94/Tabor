// Server-side gate for the private portfolio at /w/<slug>.
//
// SERVER ONLY. This module reads SUPABASE_SERVICE_ROLE_KEY; never import it from
// a client component. Everything under /w/<slug> — the HTML, every image, every
// video, the fonts — is streamed through route handlers that call requireViewer()
// first. Storage stays private; the service role never leaves the server.
//
// Two independent conditions must both hold:
//   1. a valid Supabase session (verified against the auth server, not just decoded)
//   2. an un-revoked row in private_page_access for that user
// Condition 2 matters because this project allows public sign-up for the TABOR
// mobile app, so "logged in" is not an access decision on its own.
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const BUCKET = "private-cv";
export const PAGE_KEY = "cv";

/** The unguessable path segment. Set via env so it is never committed. */
export function routeSlug(): string | null {
  const s = process.env.CV_ROUTE_SLUG;
  return s && s.length >= 8 ? s : null;
}

/** Constant-time-ish compare so the slug cannot be probed byte by byte. */
export function slugMatches(candidate: string): boolean {
  const want = routeSlug();
  if (!want || candidate.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ candidate.charCodeAt(i);
  return diff === 0;
}

export type CookieWrite = { name: string; value: string; options?: Record<string, unknown> };

/** Supabase client bound to the request cookies; queues any refreshed cookies. */
export function sessionClient(req: NextRequest) {
  const jar: CookieWrite[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => toSet.forEach((c) => jar.push(c as CookieWrite)),
      },
    },
  );
  return { supabase, jar };
}

/** Apply queued auth cookies (session refresh) to an outgoing response. */
export function applyCookies(res: NextResponse, jar: CookieWrite[]): NextResponse {
  for (const c of jar) res.cookies.set(c.name, c.value, c.options as never);
  return res;
}

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True when this user holds a live grant for the page. */
export async function hasGrant(userId: string): Promise<boolean> {
  const { data, error } = await admin()
    .from("private_page_access")
    .select("id")
    .eq("user_id", userId)
    .eq("page", PAGE_KEY)
    .is("revoked_at", null)
    .maybeSingle();
  if (error) return false; // fail CLOSED: a DB problem must never open the gate
  return !!data;
}

export type Viewer = { ok: true; userId: string; jar: CookieWrite[] } | { ok: false; jar: CookieWrite[] };

/** The single authorisation check used by every route under /w/<slug>. */
export async function requireViewer(req: NextRequest): Promise<Viewer> {
  const { supabase, jar } = sessionClient(req);
  const { data, error } = await supabase.auth.getUser();
  const user = error ? null : data.user;
  if (!user) return { ok: false, jar };
  if (!(await hasGrant(user.id))) return { ok: false, jar };
  return { ok: true, userId: user.id, jar };
}

/** Best-effort access log for the owner (who opened it, when, how often). */
export async function recordView(userId: string): Promise<void> {
  try {
    await admin().rpc("bump_private_page_view", { p_user: userId, p_page: PAGE_KEY });
  } catch {
    /* logging must never block the page */
  }
}

/**
 * Read an object from the private bucket through the Storage REST API with the
 * service role, forwarding Range / If-None-Match so video seeks instead of
 * downloading whole files before playing.
 */
export async function storageFetch(
  path: string,
  init: { range?: string | null; ifNoneMatch?: string | null; method?: "GET" | "HEAD" } = {},
): Promise<Response> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  };
  if (init.range) headers.Range = init.range;
  if (init.ifNoneMatch) headers["If-None-Match"] = init.ifNoneMatch;
  return fetch(url, { method: init.method ?? "GET", headers, cache: "no-store" });
}

/** Headers every response under /w carries, whatever the outcome. */
export function gateHeaders(extra: Record<string, string> = {}): Headers {
  const h = new Headers(extra);
  h.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
  h.set("Referrer-Policy", "no-referrer");
  h.set("Cache-Control", "private, no-store");
  return h;
}

/**
 * The unauthenticated response. Deliberately anonymous: no name, no job title,
 * no brand, nothing about what is behind it. 401, so it reads as denied to any
 * crawler or scanner that gets this far.
 */
export function loginPage(action: string, message?: string): NextResponse {
  const body = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Sign in</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0B0B0E;color:#E8E8EC;
    font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}
  form{width:min(320px,calc(100vw - 40px));display:grid;gap:12px}
  h1{font-size:15px;font-weight:600;margin:0 0 4px;color:#9A9AA8}
  label{font-size:12px;color:#8A8A98}
  input{width:100%;padding:11px 12px;border-radius:8px;border:1px solid #2A2A33;background:#141419;
    color:#E8E8EC;font-size:15px}
  input:focus{outline:2px solid #4A4A5A;outline-offset:1px}
  button{padding:11px 12px;border-radius:8px;border:0;background:#E8E8EC;color:#0B0B0E;
    font-size:15px;font-weight:600;cursor:pointer}
  p.err{margin:0;font-size:13px;color:#F87171}
</style></head>
<body>
<form method="post" action="${action}">
  <h1>Sign in</h1>
  ${message ? `<p class="err">${message}</p>` : ""}
  <div><label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="username" required autofocus></div>
  <div><label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required></div>
  <button type="submit">Continue</button>
</form>
</body></html>`;
  return new NextResponse(body, {
    status: 401,
    headers: gateHeaders({ "Content-Type": "text/html; charset=utf-8" }),
  });
}

export function notFound(): NextResponse {
  return new NextResponse("Not found", { status: 404, headers: gateHeaders({ "Content-Type": "text/plain" }) });
}
