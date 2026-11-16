// What happened when the buyer came BACK from the gateway without paying.
// Yoco sends the buyer to failureUrl (card declined) or cancelUrl (they left) and
// carries the order id there. Until Nov 16 2026 nothing read those URLs, so a
// declined buyer just landed on an empty checkout and the shop never knew (Brett,
// our first US order, was declined twice and we only heard it from him).
//
// This is a MARKER, never proof: anyone can open the URL. So it only touches an
// order that is still waiting for payment and was created in the last few hours,
// it never moves a paid order, and a later payment.succeeded webhook still wins
// (payment_failed is not terminal in the webhook route).
import { supabaseAdmin } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WINDOW_MS = 6 * 3600e3;

export type CheckoutReturn = "failed" | "cancelled";

export async function markCheckoutReturn(orderId: string | undefined, kind: CheckoutReturn): Promise<void> {
  if (!orderId || !UUID.test(orderId)) return;
  try {
    const sb = supabaseAdmin();
    const { data: o } = await sb.from("orders").select("id, status, tags, created_at").eq("id", orderId).maybeSingle();
    if (!o || !["pending_payment", "payment_failed"].includes(String(o.status))) return;
    if (Date.now() - new Date(String(o.created_at)).getTime() > WINDOW_MS) return;
    const tag = `checkout:${kind}`;
    const tags = Array.isArray(o.tags) ? (o.tags as string[]) : [];
    const patch: Record<string, unknown> = { tags: tags.includes(tag) ? tags : [...tags, tag] };
    // A decline is a failed payment, same as Yoco's payment.failed webhook. A cancel
    // keeps the order pending, so the abandoned-checkout nudge can still reach them.
    if (kind === "failed" && o.status === "pending_payment") patch.status = "payment_failed";
    await sb.from("orders").update(patch).eq("id", orderId).in("status", ["pending_payment", "payment_failed"]);
  } catch { /* a marker must never break the checkout page */ }
}
