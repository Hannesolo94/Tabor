// Printful ORDERS (Nov 16 2026). Until now Tabor only read Printful products, so every paid order had to be
// placed in Printful by hand. This adds the order side, server-only:
//   - map an order's lines to Printful sync variants (products.printful_variants, filled by the Suppliers sync)
//   - estimate what Printful would charge (POST /orders/estimate-costs), before an order exists
//   - read a Printful order (status + real costs)
//   - create a DRAFT order (confirm=false: Printful does NOT charge or print a draft)
//   - confirm a draft (POST /orders/{id}/confirm). THIS is when Printful charges Hannes's billing method.
// The shipping address goes to Printful from here and never leaves the server (the hub never sees it).
// The automatic draft on payment is behind app_settings "printful_autodraft" = { enabled: false } by default.
import { supabaseAdmin } from "@/lib/supabase/admin";

const BASE = "https://api.printful.com";

function headers(): Record<string, string> {
  const key = process.env.PRINTFUL_API_KEY;
  if (!key) throw new Error("PRINTFUL_API_KEY not set");
  const h: Record<string, string> = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  if (process.env.PRINTFUL_STORE_ID) h["X-PF-Store-Id"] = process.env.PRINTFUL_STORE_ID;
  return h;
}

async function pf<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: headers(), cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(`Printful ${json.code ?? res.status}: ${json.error?.message ?? json.result ?? "request failed"}`);
  return json.result as T;
}

export interface PfCosts { subtotal: number; shipping: number; tax: number; vat: number; total: number; currency: string }
export interface PfOrder { id: number; status: string; created: number | null; updated: number | null; costs: PfCosts | null; shipments: number }

interface Line { sku?: string; name?: string; size?: string | null; qty?: number }
interface OrderRow { id: string; items: unknown; shipping: unknown; printful_order_id?: string | null }
type Variant = { size?: string | null; color?: string | null; syncVariantId?: number };

const num = (v: unknown) => Number(v ?? 0) || 0;
const costsOf = (c: Record<string, unknown> | null | undefined): PfCosts | null => c ? {
  subtotal: num(c.subtotal), shipping: num(c.shipping), tax: num(c.tax), vat: num(c.vat), total: num(c.total), currency: String(c.currency ?? "USD"),
} : null;

/** Printful's external_id allows 32 characters: the order uuid without its dashes. */
export const pfExternalId = (orderId: string) => orderId.replace(/-/g, "");

/** Each line as a Printful sync variant. Lines that can't be mapped are returned in `missing`, never guessed. */
export async function printfulItems(order: OrderRow): Promise<{ items: { sync_variant_id: number; quantity: number }[]; missing: string[] }> {
  const lines = (Array.isArray(order.items) ? order.items : []) as Line[];
  const skus = [...new Set(lines.map((l) => String(l.sku ?? "")).filter(Boolean))];
  const { data } = skus.length ? await supabaseAdmin().from("products").select("sku, printful_variants").in("sku", skus) : { data: [] };
  const bySku = new Map((data ?? []).map((p) => [String(p.sku), (p.printful_variants ?? []) as Variant[]]));
  const items: { sync_variant_id: number; quantity: number }[] = [];
  const missing: string[] = [];
  for (const l of lines) {
    const vs = bySku.get(String(l.sku ?? "")) ?? [];
    const v = l.size ? vs.find((x) => String(x.size ?? "").toLowerCase() === String(l.size).toLowerCase()) : vs.length === 1 ? vs[0] : undefined;
    if (v?.syncVariantId) items.push({ sync_variant_id: Number(v.syncVariantId), quantity: Math.max(1, Number(l.qty) || 1) });
    else missing.push(`${l.name ?? l.sku}${l.size ? ` (${l.size})` : ""}`);
  }
  return { items, missing };
}

function recipient(order: OrderRow) {
  const s = (order.shipping ?? {}) as Record<string, string>;
  return {
    name: s.name, address1: s.line1, address2: s.line2 || undefined, city: s.city,
    state_code: s.province || undefined, country_code: String(s.country ?? "").toUpperCase(), zip: s.postal,
  };
}

/** What Printful would charge for this order now (an ESTIMATE: no order is created). */
export async function estimatePrintful(order: OrderRow): Promise<{ costs: PfCosts | null; missing: string[]; error?: string }> {
  const { items, missing } = await printfulItems(order);
  if (!items.length || missing.length) return { costs: null, missing, error: missing.length ? "some items have no Printful variant" : "no items" };
  try {
    const r = await pf<{ costs: Record<string, unknown> }>("/orders/estimate-costs", { method: "POST", body: JSON.stringify({ recipient: recipient(order), items }) });
    return { costs: costsOf(r.costs), missing };
  } catch (e) {
    return { costs: null, missing, error: e instanceof Error ? e.message : "estimate failed" };
  }
}

/** A Printful order by its id (status + what Printful actually charged / will charge). */
export async function getPrintfulOrder(pfId: string): Promise<PfOrder | null> {
  try {
    const r = await pf<Record<string, unknown>>(`/orders/${encodeURIComponent(pfId)}`);
    return { id: num(r.id), status: String(r.status ?? ""), created: r.created ? num(r.created) : null, updated: r.updated ? num(r.updated) : null,
      costs: costsOf(r.costs as Record<string, unknown>), shipments: Array.isArray(r.shipments) ? r.shipments.length : 0 };
  } catch { return null; }
}

/** Create a DRAFT at Printful and store its id on the order. Nothing is charged or printed until it is confirmed. */
export async function createPrintfulDraft(orderId: string): Promise<{ ok: boolean; printfulOrderId?: string; error?: string }> {
  const sb = supabaseAdmin();
  const { data: o } = await sb.from("orders").select("id, status, items, shipping, printful_order_id").eq("id", orderId).maybeSingle();
  if (!o) return { ok: false, error: "order not found" };
  if (o.printful_order_id) return { ok: true, printfulOrderId: String(o.printful_order_id) };
  if (!["paid", "processing"].includes(String(o.status))) return { ok: false, error: `only a paid order goes to Printful (this one is ${o.status})` };
  const { items, missing } = await printfulItems(o);
  if (missing.length || !items.length) return { ok: false, error: `no Printful variant for: ${missing.join(", ") || "any item"}` };
  try {
    // confirm=false (the default) keeps it a draft. external_id makes a retry find the same order instead of a second one.
    const r = await pf<{ id: number }>("/orders?confirm=false", { method: "POST", body: JSON.stringify({ external_id: pfExternalId(o.id), recipient: recipient(o), items }) });
    const id = String(r.id);
    await sb.from("orders").update({ printful_order_id: id, supplier: "printful" }).eq("id", o.id).is("printful_order_id", null);
    await sb.from("audit_log").insert({ actor: "agent", action: "order.printful_draft", entity: "order", entity_id: o.id, detail: { printful_order_id: id } });
    return { ok: true, printfulOrderId: id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Printful draft failed" };
  }
}

/** Confirm a draft. Printful charges the billing method set in Printful and starts printing. Only ever on Hannes's press. */
export async function confirmPrintfulDraft(orderId: string): Promise<{ ok: boolean; status?: string; error?: string }> {
  const sb = supabaseAdmin();
  const { data: o } = await sb.from("orders").select("id, status, printful_order_id").eq("id", orderId).maybeSingle();
  if (!o?.printful_order_id) return { ok: false, error: "this order has no Printful draft yet" };
  const cur = await getPrintfulOrder(String(o.printful_order_id));
  if (!cur) return { ok: false, error: "could not read the Printful order" };
  if (cur.status !== "draft") return { ok: false, error: `the Printful order is already ${cur.status}` };
  try {
    const r = await pf<{ status: string }>(`/orders/${encodeURIComponent(String(o.printful_order_id))}/confirm`, { method: "POST" });
    await sb.from("audit_log").insert({ actor: "agent", action: "order.printful_confirm", entity: "order", entity_id: o.id, detail: { printful_order_id: o.printful_order_id, status: r.status } });
    return { ok: true, status: r.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Printful confirm failed" };
  }
}

/** The automatic draft on payment. OFF unless Hannes switches it on (app_settings "printful_autodraft"). */
export async function autodraftEnabled(): Promise<boolean> {
  const { data } = await supabaseAdmin().from("app_settings").select("value").eq("key", "printful_autodraft").maybeSingle();
  return !!(data?.value as { enabled?: boolean } | null)?.enabled;
}
