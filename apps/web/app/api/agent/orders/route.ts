// Checkout watch + ORDERS for the BurgerBot hub (Nov 16 2026). ONE source for both the TABOR ORDER pop-up and the
// hub's TABOR > ORDERS tab, so the two never disagree.
//
// GET /api/agent/orders?since=            every order created since (default 48 h): where it stands now. Cheap, DB only;
//                                          the hub polls it every minute and calls a pending order abandoned after 30 min.
// GET /api/agent/orders?since=&detail=1   adds the order number, Printful state and costs, the money line and what
//                                          needs Hannes (NEEDS YOU). Calls Printful, so the hub only asks when the tab opens.
// POST { action: "printful-draft", id }    put a paid order into Printful as a DRAFT (nothing charged or printed)
// POST { action: "printful-confirm", id }  confirm that draft: Printful charges its billing method and prints
// POST { action: "autodraft", enabled }    the automatic draft on payment (OFF by default)
// The hub only sends POSTs from Hannes's own devices. Agent key.
//
// Deliberately thin on personal data: the buyer's FIRST NAME and country only. No email, address, phone or card.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { agentAuthorized } from "@/lib/agent-auth";
import { estimatePrintful, getPrintfulOrder, createPrintfulDraft, confirmPrintfulDraft, autodraftEnabled, type PfCosts } from "@/lib/printful-orders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAID = ["paid", "processing", "fulfilled", "shipped"];
const ABANDON_MS = 30 * 60e3;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://tabor.quest").replace(/\/$/, "");
// Yoco's card fees per lib/payments/yoco.ts: 3.40% international, 2.95% local, ex VAT. VAT 15% on the fee.
// The card's origin isn't known to Tabor, so the shipping country stands in for it: an ESTIMATE, labelled so.
const YOCO_LOCAL = 0.0295, YOCO_INTL = 0.034, VAT = 0.15;

function outcome(status: string, tags: string[]): string {
  if (PAID.includes(status)) return "paid";
  if (status === "payment_failed") return "failed";
  if (status === "refunded" || status === "refund_pending") return "refunded";
  if (status === "cancelled" || tags.includes("checkout:cancelled")) return "cancelled";
  if (tags.includes("checkout:failed")) return "failed";
  return "pending";
}

type Row = Record<string, unknown> & { id: string; created_at: string; status: string; email?: string | null };

function base(o: Row) {
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
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export async function GET(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const u = new URL(req.url);
  const detail = u.searchParams.get("detail") === "1";
  const sinceRaw = u.searchParams.get("since");
  // the pop-up looks back at most 7 days; the ORDERS tab up to a year
  const floor = Date.now() - (detail ? 366 : 7) * 864e5;
  const sinceMs = sinceRaw && !isNaN(Date.parse(sinceRaw)) ? Math.max(Date.parse(sinceRaw), floor) : Date.now() - 48 * 3600e3;
  const sb = supabaseAdmin();

  const { data, error } = await sb.from("orders")
    .select("id, created_at, status, total, currency, settlement_amount, settlement_currency, items, shipping, tags, payment_provider, discount_code" + (detail ? ", email, printful_order_id, supplier" : ""))
    .gt("created_at", new Date(sinceMs).toISOString())
    .order("created_at", { ascending: true }).limit(detail ? 1000 : 300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as unknown as Row[];
  if (!detail) return NextResponse.json({ since: new Date(sinceMs).toISOString(), now: new Date().toISOString(), orders: rows.map(base) });

  // ---- detail (ORDERS tab) ----
  const now = Date.now();
  // Tabor has no order-number column: the number is the order's place in line (#0001 = the first order ever).
  // Stable as long as no order row is ever deleted.
  const { data: all } = await sb.from("orders").select("id, created_at").order("created_at", { ascending: true }).order("id").limit(100000);
  const numberOf = new Map((all ?? []).map((r, i) => [String(r.id), i + 1]));
  // a declined / abandoned buyer who came back and paid later needs no follow-up (matched by email here, never sent out)
  const paidAt = new Map<string, number[]>();
  for (const o of rows) if (PAID.includes(String(o.status)) && o.email) { const k = String(o.email).toLowerCase(); paidAt.set(k, [...(paidAt.get(k) ?? []), Date.parse(o.created_at)]); }
  const { data: fx } = await sb.from("fx_rates").select("rate_per_usd, fetched_at").eq("currency", "ZAR").maybeSingle();
  const zarPerUsd = Number(fx?.rate_per_usd ?? 0) || null;
  const toZar = (c: PfCosts | null) => !c ? null : c.currency === "ZAR" ? c.total : c.currency === "USD" && zarPerUsd ? r2(c.total * zarPerUsd) : null;

  // Printful look-ups, newest first, bounded so one tab open can't hammer Printful
  const recent = [...rows].reverse();
  const pfIds = recent.filter((o) => o.printful_order_id).slice(0, 60);
  const toEstimate = recent.filter((o) => PAID.includes(String(o.status)) && !o.printful_order_id).slice(0, 25);
  const [pfOrders, estimates, auto] = await Promise.all([
    Promise.all(pfIds.map(async (o) => [o.id, await getPrintfulOrder(String(o.printful_order_id))] as const)),
    Promise.all(toEstimate.map(async (o) => [o.id, await estimatePrintful({ id: o.id, items: o.items, shipping: o.shipping })] as const)),
    autodraftEnabled().catch(() => false),
  ]);
  const pfBy = new Map(pfOrders), estBy = new Map(estimates);

  const orders = rows.map((o) => {
    const b = base(o);
    const ageMs = now - Date.parse(o.created_at);
    const admin = `${SITE}/admin/orders/${o.id}`;
    const pfo = pfBy.get(o.id) ?? null;
    const est = estBy.get(o.id) ?? null;
    const retriedPaid = !!(o.email && (paidAt.get(String(o.email).toLowerCase()) ?? []).some((t) => t > Date.parse(o.created_at)));

    // the stage the tab shows
    let stage = b.outcome === "failed" ? "declined" : b.outcome === "pending" ? (ageMs > ABANDON_MS ? "abandoned" : "started") : b.outcome;
    if (o.status === "refund_pending") stage = "refund pending";
    if (o.status === "fulfilled") stage = "fulfilled";
    if (o.status === "shipped" || pfo?.status === "fulfilled") stage = "shipped";

    // money (paid orders only): what Yoco captured in rand, its fee (est.), what Printful costs, what is left
    let money = null as null | Record<string, unknown>;
    if (b.outcome === "paid" || o.status === "refund_pending") {
      const paidZar = b.settlement && String(b.settlement.currency) === "ZAR" ? Number(b.settlement.amount) : b.currency === "ZAR" ? Number(b.total) : null;
      const intl = b.country !== "ZA";
      const fee = paidZar != null ? r2(paidZar * (intl ? YOCO_INTL : YOCO_LOCAL) * (1 + VAT)) : null;
      const real = pfo?.costs && pfo.status !== "draft" ? pfo.costs : null;   // a draft's costs are still Printful's estimate
      const guess = !real ? (pfo?.costs ?? est?.costs ?? null) : null;
      const pfZar = toZar(real ?? guess);
      money = {
        paidZar, fee, feeEst: true, feeRate: `${intl ? "3.40" : "2.95"}% + VAT (${intl ? "international" : "local"} card assumed from the shipping country)`,
        printful: real ? { ...real, zar: pfZar, est: false } : guess ? { ...guess, zar: pfZar, est: true } : null,
        printfulNote: real || guess ? (zarPerUsd && (real ?? guess)!.currency === "USD" ? `USD at R${zarPerUsd.toFixed(2)}` : null) : (est?.error ?? null),
        left: paidZar != null && fee != null && pfZar != null ? r2(paidZar - fee - pfZar) : null,
        leftEst: true,
      };
    }

    // NEEDS YOU: one line each, what to do
    const needs: { what: string; act?: string }[] = [];
    if (stage === "declined" && !retriedPaid && ageMs < 7 * 864e5) needs.push({ what: "Declined at Yoco. Check the order in admin and reach out to the buyer, or give them a moment to retry with another card." });
    if (stage === "cancelled" && !retriedPaid && ageMs < 7 * 864e5) needs.push({ what: "Left at the payment page. Follow up from admin, or let the checkout reminder email do it if it's on." });
    if (stage === "abandoned" && !retriedPaid && ageMs < 7 * 864e5) needs.push({ what: "Abandoned before paying. Follow up from admin, or let the checkout reminder email do it if it's on." });
    if (b.outcome === "paid" && !o.printful_order_id && !["fulfilled", "shipped"].includes(String(o.status))) needs.push({ what: "Place in Printful: this paid order has not been sent for printing.", act: "printful-draft" });
    if (pfo?.status === "draft") needs.push({ what: "Printful draft waiting. Confirm at Printful to print and ship it (Printful charges its billing method then).", act: "printful-confirm" });
    if (pfo && ["failed", "onhold", "canceled", "partial"].includes(pfo.status) && b.outcome === "paid") needs.push({ what: `Printful says this order is ${pfo.status === "onhold" ? "on hold" : pfo.status}. Open it in Printful and sort it out.` });
    if (o.printful_order_id && !pfo) needs.push({ what: "Could not read the Printful order. Check it in Printful." });
    if (pfo?.status === "pending" && pfo.updated && now - pfo.updated * 1000 > 3 * 864e5) needs.push({ what: "At Printful for 3+ days and not printing yet. Check it in Printful." });
    if (pfo?.status === "inprocess" && pfo.updated && now - pfo.updated * 1000 > 7 * 864e5) needs.push({ what: "Printing for 7+ days with no shipment. Check it in Printful." });
    if (o.status === "processing" && ageMs > 3 * 864e5 && !pfo) needs.push({ what: "Stuck in processing for 3+ days. Check the order in admin." });
    if (o.status === "refund_pending" && ageMs > 864e5) needs.push({ what: "Refund requested, Yoco hasn't confirmed it yet. Check it in the Yoco portal." });

    return { ...b, number: numberOf.get(o.id) ?? null, stage, retriedPaid, admin,
      printful: o.printful_order_id ? { id: String(o.printful_order_id), status: pfo?.status ?? null, shipments: pfo?.shipments ?? 0 } : null,
      money, needs };
  });

  return NextResponse.json({
    since: new Date(sinceMs).toISOString(), now: new Date().toISOString(), orders,
    autodraft: auto, fx: zarPerUsd ? { zarPerUsd, at: fx?.fetched_at ?? null } : null,
  });
}

export async function POST(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const id = String(b.id ?? "");
  const sb = supabaseAdmin();
  if (b.action === "printful-draft") return NextResponse.json(await createPrintfulDraft(id));
  if (b.action === "printful-confirm") return NextResponse.json(await confirmPrintfulDraft(id));
  if (b.action === "autodraft") {
    const enabled = b.enabled === true;
    await sb.from("app_settings").upsert({ key: "printful_autodraft", value: { enabled }, updated_at: new Date().toISOString() });
    await sb.from("audit_log").insert({ actor: "agent", action: "printful.autodraft", entity: "app_settings", entity_id: "printful_autodraft", detail: { enabled, via: "burgerbot-hub" } });
    return NextResponse.json({ ok: true, enabled });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
