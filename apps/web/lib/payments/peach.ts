// Peach Payments provider. Reads creds from the integrations table
// (provider='peach': secret=access token, meta.entityId, meta.mode=test|live).
// Skeleton: falls back to the manual flow until the live Checkout API call is
// implemented + verified against a Peach sandbox. Switching it on = add creds in
// Settings > Integrations + set PAYMENT_PROVIDER_ZA/INTL=peach.
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pendingManual, type PaymentOrder, type PaymentResult, type PaymentProvider } from "../payments";

interface PeachCreds { token: string; entityId: string; base: string }
async function creds(): Promise<PeachCreds | null> {
  const { data } = await supabaseAdmin().from("integrations").select("secret, enabled, meta").eq("provider", "peach").maybeSingle();
  if (!data?.enabled || !data.secret) return null;
  const meta = (data.meta ?? {}) as { entityId?: string; mode?: string };
  if (!meta.entityId) return null;
  return { token: String(data.secret), entityId: meta.entityId, base: meta.mode === "live" ? "https://eu-prod.oppwa.com" : "https://eu-test.oppwa.com" };
}

export const peachProvider: PaymentProvider = {
  id: "peach",
  async start(order: PaymentOrder): Promise<PaymentResult> {
    const c = await creds();
    if (!c) return pendingManual(order, "peach");
    // TODO (when Peach is live + sandbox-tested):
    //   POST `${c.base}/v1/checkouts` (Bearer token, x-www-form-urlencoded)
    //     entityId, amount=order.total.toFixed(2), currency=order.currency,
    //     paymentType=DB, merchantTransactionId=order.id
    //   -> returns { id }. Send the buyer to a hosted page that loads the Peach
    //      widget with that checkout id, then confirm via verifyWebhook below.
    return pendingManual(order, "peach");
  },
  async verifyWebhook(_req: Request) {
    // TODO: verify the Peach webhook (decrypt/validate), map merchantTransactionId
    // -> order id, return { orderId, paid: result.code is a success code }.
    return null;
  },
};
