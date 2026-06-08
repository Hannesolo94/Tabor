// PayPal provider (best path for INTERNATIONAL acceptance from a SA business).
// Creds in integrations (provider='paypal': secret=client secret, meta.clientId,
// meta.mode=sandbox|live). Skeleton: falls back to manual until implemented +
// sandbox-tested. Intended route: PAYMENT_PROVIDER_INTL=paypal.
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pendingManual, type PaymentOrder, type PaymentResult, type PaymentProvider } from "../payments";

interface PayPalCreds { clientId: string; secret: string; base: string }
async function creds(): Promise<PayPalCreds | null> {
  const { data } = await supabaseAdmin().from("integrations").select("secret, enabled, meta").eq("provider", "paypal").maybeSingle();
  if (!data?.enabled || !data.secret) return null;
  const meta = (data.meta ?? {}) as { clientId?: string; mode?: string };
  if (!meta.clientId) return null;
  return { clientId: meta.clientId, secret: String(data.secret), base: meta.mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com" };
}

export const paypalProvider: PaymentProvider = {
  id: "paypal",
  async start(order: PaymentOrder): Promise<PaymentResult> {
    const c = await creds();
    if (!c) return pendingManual(order, "paypal");
    // TODO (when live + sandbox-tested):
    //   1) OAuth: POST `${c.base}/v1/oauth2/token` (Basic clientId:secret) -> access_token
    //   2) POST `${c.base}/v2/checkout/orders` with purchase_units[].amount
    //      {currency_code: order.currency, value: order.total} + custom_id=order.id
    //   -> redirect buyer to the returned "approve" link; capture on return/webhook.
    return pendingManual(order, "paypal");
  },
  async verifyWebhook(_req: Request) {
    // TODO: verify PayPal webhook signature, on PAYMENT.CAPTURE.COMPLETED return
    // { orderId: custom_id, paid: true, ref: capture id }.
    return null;
  },
};
