// Checkout watch for the BurgerBot hub's TABOR ORDER pop-up (Nov 16 2026). Every order created
// since a moment, with where it stands now: started (pending), paid, declined or cancelled. The hub
// polls this every minute and calls a still-pending order abandoned after 30 min itself.
//
// Read-only. Agent key. Deliberately thin on personal data: the buyer's FIRST NAME and country only.
// No email, no address, no phone, nothing about the card.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { agentAuthorized } from "@/lib/agent-auth";

export const dynamic = "force-dynamic";

const PAID = ["paid", "processing", "fulfilled", "shipped"];

function outcome(status: string, tags: string[]): string {
  if (PAID.includes(status)) return "paid";
  if (status === "payment_failed") return "failed";
  if (status === "refunded" || status === "refund_pending") return "refunded";
  if (status === "cancelled" || tags.includes("checkout:cancelled")) return "cancelled";
  if (tags.includes("checkout:failed")) return "failed";
  return "pending";
}

export async function GET(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const sinceRaw = u.searchParams.get("since");
  // at most 7 days back; default the last 48 hours
  const floor = Date.now() - 7 * 864e5;
  const sinceMs = sinceRaw && !isNaN(Date.parse(sinceRaw)) ? Math.max(Date.parse(sinceRaw), floor) : Date.now() - 48 * 3600e3;

  const { data, error } = await supabaseAdmin().from("orders")
    .select("id, created_at, status, total, currency, settlement_amount, settlement_currency, items, shipping, tags, payment_provider, discount_code")
    .gt("created_at", new Date(sinceMs).toISOString())
    .order("created_at", { ascending: true }).limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = (data ?? []).map((o) => {
    const ship = (o.shipping ?? {}) as Record<string, unknown>;
    const tags = Array.isArray(o.tags) ? (o.tags as string[]) : [];
    const items = (Array.isArray(o.items) ? o.items : []) as Record<string, unknown>[];
    return {
      id: o.id,
      created: o.created_at,
      status: o.status,
      outcome: outcome(String(o.status), tags),
      returns: tags.filter((t) => t.startsWith("checkout:")).map((t) => t.slice(9)),   // what the buyer came back from the gateway with
      total: o.total,
      currency: o.currency,
      settlement: o.settlement_amount != null ? { amount: o.settlement_amount, currency: o.settlement_currency ?? "ZAR" } : null,
      itemsCount: items.reduce((n, i) => n + (Number(i.qty) || 1), 0),
      items: items.map((i) => ({ name: String(i.name ?? i.sku ?? "Item"), size: i.size ?? null, qty: Number(i.qty) || 1 })),
      country: String(ship.country ?? "").toUpperCase() || null,
      firstName: String(ship.name ?? "").trim().split(/\s+/)[0]?.slice(0, 30) || null,
      provider: o.payment_provider ?? null,
      code: o.discount_code ?? null,
    };
  });
  return NextResponse.json({ since: new Date(sinceMs).toISOString(), now: new Date().toISOString(), orders });
}
