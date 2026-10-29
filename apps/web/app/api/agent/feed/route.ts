// Live customer feed for the BurgerBot hub's TABOR > CUSTOMERS tab: product views, add to cart,
// checkout starts and purchases since a moment, with where the visitor came from and the product.
// Visitors stay anonymous (a short visitor tag); order emails are masked. Agent key, read-only.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { agentAuthorized } from "@/lib/agent-auth";
import { channel } from "@/lib/channel";

export const dynamic = "force-dynamic";

const mask = (e: string) => { const [u, d] = String(e || "").split("@"); return u && d ? `${u.slice(0, 1)}***@${d}` : ""; };
const tag = (v: unknown) => String(v ?? "").replace(/[^a-z0-9]/gi, "").slice(-6) || "anon";

export async function GET(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const sinceRaw = u.searchParams.get("since");
  const since = sinceRaw && !isNaN(Date.parse(sinceRaw)) ? new Date(sinceRaw) : new Date(Date.now() - 24 * 3600e3);
  const sb = supabaseAdmin();

  const [ev, orders, products] = await Promise.all([
    sb.from("analytics_events").select("type, path, referrer, meta, sku, value, visitor_id, session_id, created_at")
      .in("type", ["pageview", "add_to_cart", "begin_checkout", "purchase"]).gt("created_at", since.toISOString())
      .order("created_at", { ascending: true }).limit(2000),
    // new orders since, plus last week's orders that are paid now (so the hub sees the moment one turns paid)
    sb.from("orders").select("id, status, total, currency, items, discount_code, tags, email, created_at")
      .or(`created_at.gt.${since.toISOString()},and(status.in.(paid,processing,fulfilled,shipped),created_at.gt.${new Date(Date.now() - 7 * 864e5).toISOString()})`)
      .order("created_at", { ascending: true }).limit(300),
    sb.from("products").select("sku, name, image_url"),
  ]);
  const prod = new Map((products.data ?? []).map((p) => [String(p.sku), p]));

  // each visitor's first known source, so a cart or checkout keeps the channel they arrived from
  const firstChannel = new Map<string, string>();
  const events = [];
  for (const e of ev.data ?? []) {
    const v = String(e.visitor_id ?? "");
    const ch = channel(e.referrer as string | null, e.meta as Record<string, unknown> | null);
    if (v && !firstChannel.has(v) && ch !== "direct") firstChannel.set(v, ch);
    const isProduct = e.type === "pageview" && /^\/product\//.test(String(e.path));
    if (e.type === "pageview" && !isProduct) continue;   // only product views, not every page
    const sku = String(e.sku ?? (isProduct ? String(e.path).split("/")[2] : "") ?? "");
    const p = prod.get(sku);
    events.push({
      kind: isProduct ? "view" : e.type === "add_to_cart" ? "cart" : e.type === "begin_checkout" ? "checkout" : "to_payment",   // the site fires purchase on the way to the gateway, before payment
      at: e.created_at, sku, product: p?.name ?? (sku || null), image: p?.image_url ?? null,
      value: e.value, visitor: tag(v), channel: firstChannel.get(v) ?? ch,
    });
  }

  return NextResponse.json({
    since: since.toISOString(), now: new Date().toISOString(), events,
    orders: (orders.data ?? []).map((o) => ({
      id: o.id, status: o.status, total: o.total, currency: o.currency, at: o.created_at, email: mask(String(o.email ?? "")),
      items: (Array.isArray(o.items) ? o.items : []).map((i: Record<string, unknown>) => ({ name: i.name ?? i.sku, qty: i.qty ?? 1, size: i.size ?? null })),
      code: o.discount_code, nudged: Array.isArray(o.tags) && o.tags.includes("nudge:abandoned"),
    })),
  });
}
