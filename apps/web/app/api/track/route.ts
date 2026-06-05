// First-party analytics ingest. Stores events server-side (service role). Filters
// obvious bots. Public endpoint (no auth) but writes nothing readable to clients.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BOT = /(bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pingdom|monitor)/i;
const TYPES = new Set(["pageview", "add_to_cart", "begin_checkout", "purchase", "app_click"]);

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return NextResponse.json({ ok: true, skipped: "bot" });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const type = String(b.type ?? "");
  if (!TYPES.has(type)) return NextResponse.json({ error: "bad type" }, { status: 400 });

  // never track the admin area
  const path = String(b.path ?? "").slice(0, 300);
  if (path.startsWith("/admin")) return NextResponse.json({ ok: true, skipped: "admin" });

  const sb = supabaseAdmin();
  await sb.from("analytics_events").insert({
    type,
    path,
    referrer: String(b.referrer ?? "").slice(0, 300) || null,
    session_id: String(b.session_id ?? "").slice(0, 64) || null,
    visitor_id: String(b.visitor_id ?? "").slice(0, 64) || null,
    sku: b.sku ? String(b.sku).slice(0, 80) : null,
    value: b.value != null ? Number(b.value) || null : null,
    meta: (b.meta as object) ?? {},
  });

  return NextResponse.json({ ok: true });
}
