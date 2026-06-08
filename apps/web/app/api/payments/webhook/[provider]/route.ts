// Payment webhook receiver. Each gateway POSTs here on payment events; the
// provider verifies the callback and we mark the order paid. One endpoint per
// provider: /api/payments/webhook/peach | paypal | yoco.
import { NextResponse } from "next/server";
import { providerById } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const p = providerById(provider);
  if (!p?.verifyWebhook) return NextResponse.json({ error: "unknown provider" }, { status: 404 });

  const result = await p.verifyWebhook(req);
  if (!result) return NextResponse.json({ ok: true, ignored: true });

  if (result.paid) {
    await supabaseAdmin().from("orders").update({ status: "paid", payment_provider: provider, payment_ref: result.ref ?? null }).eq("id", result.orderId);
  }
  return NextResponse.json({ ok: true });
}
