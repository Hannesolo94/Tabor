// Yoco provider (fast SA onboarding, good for LOCAL ZA card acceptance).
// Creds in integrations (provider='yoco': secret=secret key, meta.mode). Skeleton:
// falls back to manual until implemented + tested. Intended route:
// PAYMENT_PROVIDER_ZA=yoco.
import { supabaseAdmin } from "@/lib/supabase/admin";
import { pendingManual, type PaymentOrder, type PaymentResult, type PaymentProvider } from "../payments";

async function creds(): Promise<{ secret: string } | null> {
  const { data } = await supabaseAdmin().from("integrations").select("secret, enabled").eq("provider", "yoco").maybeSingle();
  if (!data?.enabled || !data.secret) return null;
  return { secret: String(data.secret) };
}

export const yocoProvider: PaymentProvider = {
  id: "yoco",
  async start(order: PaymentOrder): Promise<PaymentResult> {
    const c = await creds();
    if (!c) return pendingManual(order, "yoco");
    // TODO (when live + tested): Yoco Checkout API
    //   POST https://payments.yoco.com/api/checkouts (Bearer secret key)
    //     amount=Math.round(order.total*100), currency=order.currency (ZAR),
    //     metadata.orderId=order.id, successUrl/cancelUrl
    //   -> returns { redirectUrl }. Confirm via webhook.
    return pendingManual(order, "yoco");
  },
  async verifyWebhook(_req: Request) {
    // TODO: verify Yoco webhook (signing secret), return { orderId, paid }.
    return null;
  },
};
