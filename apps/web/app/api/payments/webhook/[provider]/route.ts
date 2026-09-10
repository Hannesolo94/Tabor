// Payment webhook receiver. The gateway POSTs here; the provider verifies the
// signature over the RAW body and reports whether the order is paid.
//
// This endpoint is the ONLY thing that may mark an order paid. A success
// redirect proves nothing: anyone can visit that URL.
import { NextResponse } from "next/server";
import { providerById } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const p = providerById(provider);
  if (!p?.verifyWebhook) return NextResponse.json({ error: "unknown provider" }, { status: 404 });

  // A bad signature is indistinguishable from an attack, so say nothing useful.
  const result = await p.verifyWebhook(req);
  if (!result) return NextResponse.json({ ok: false }, { status: 400 });

  const sb = supabaseAdmin();

  // Replay protection. Gateways redeliver on timeout, and a redelivered
  // "succeeded" must not re-run anything. The primary key does the work.
  if (result.eventId) {
    const { error: dupe } = await sb.from("payment_events").insert({
      id: result.eventId,
      provider,
      type: result.eventType ?? "unknown",
      order_id: result.orderId,
      payload: result.raw ?? {},
    });
    // 23505 = already applied. Acknowledge so the gateway stops retrying.
    if (dupe && (dupe as { code?: string }).code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  if (result.outcome === "paid") {
    const patch: Record<string, unknown> = {
      status: "paid",
      payment_provider: provider,
      payment_ref: result.ref ?? null,
      gateway_payment_id: result.ref ?? null,
    };
    // Record what the gateway actually captured, which is the figure a refund
    // must use and the figure a payout reconciles against.
    if (typeof result.settlementAmount === "number") patch.settlement_amount = result.settlementAmount;
    if (result.settlementCurrency) patch.settlement_currency = result.settlementCurrency;

    // Yoco does not guarantee ordering, so a success arriving after a failure
    // must still win. Only a terminal state (paid, refunded, cancelled) blocks it.
    await sb.from("orders").update(patch).eq("id", result.orderId)
      .in("status", ["pending_payment", "processing", "payment_failed"]);
  } else if (result.outcome === "failed") {
    // Never downgrade an order that already succeeded.
    await sb.from("orders").update({ status: "payment_failed" }).eq("id", result.orderId).eq("status", "pending_payment");
  } else if (result.outcome === "refunded") {
    await sb.from("orders").update({ status: "refunded" }).eq("id", result.orderId).in("status", ["paid", "processing"]);
  } else if (result.outcome === "refund_failed") {
    // Leave the order alone; the money never moved. The event row is the record.
  }

  return NextResponse.json({ ok: true });
}
