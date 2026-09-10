"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function updateOrderStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;
  const sb = await supabaseServer();
  await sb.from("orders").update({ status }).eq("id", id);
  await logAudit("order.status", "order", id, { status });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function saveOrderMeta(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const tags = String(formData.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const sb = await supabaseServer();
  await sb.from("orders").update({ notes, tags }).eq("id", id);
  await logAudit("order.meta", "order", id);
  revalidatePath(`/admin/orders/${id}`);
}

/**
 * Refund an order through the gateway.
 *
 * Refunds are issued against the CHECKOUT id, not the payment id, which is why
 * orders.gateway_checkout_id is stored. Yoco answers 202 and confirms
 * asynchronously, so this does NOT mark the order refunded: the refund.succeeded
 * webhook does that. Until it lands the order sits in refund_pending, which is
 * honest about the fact the money has not moved yet.
 *
 * Amount is omitted, so this is a full refund of what was captured.
 */
export async function refundOrder(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Every redirect happens at the END. That lets the work sit inside a
  // try/catch without swallowing redirect's control-flow throw, and means a
  // money action can never leave the operator on a server-error page with no
  // idea whether the refund went through.
  let query = "?refund=requested";
  try {
    const { isCallerOwner } = await import("@/lib/admin-guard");
    if (!(await isCallerOwner())) {
      query = "?err=not-owner";
    } else {
      const sb = await supabaseServer();
      const { data: o } = await sb
        .from("orders")
        .select("id,status,payment_provider,gateway_checkout_id,settlement_amount,settlement_currency,total,currency")
        .eq("id", id)
        .maybeSingle();

      const reason =
        !o ? "order not found"
        : o.status !== "paid" ? `only a paid order can be refunded (this one is ${o.status})`
        : o.payment_provider !== "yoco" ? `no gateway refund for ${o.payment_provider ?? "manual"}`
        : !o.gateway_checkout_id ? "no gateway checkout id on this order"
        : null;

      if (reason) {
        query = `?err=${encodeURIComponent(reason)}`;
      } else {
        const { refundYocoCheckout } = await import("@/lib/payments/yoco");
        // Idempotency key ties the refund to the order, so a double submit
        // cannot issue two refunds.
        const res = await refundYocoCheckout(String(o!.gateway_checkout_id), undefined, `refund-${id}`);
        if (!res.ok) {
          await logAudit("order.refund.failed", "order", id, { error: res.error });
          query = `?err=${encodeURIComponent(res.error ?? "refund failed")}`;
        } else {
          await sb.from("orders").update({ status: "refund_pending" }).eq("id", id);
          await logAudit("order.refund", "order", id, {
            amount: o!.settlement_amount ?? o!.total,
            currency: o!.settlement_currency ?? o!.currency,
          });
        }
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "refund failed unexpectedly";
    await logAudit("order.refund.error", "order", id, { error: msg });
    query = `?err=${encodeURIComponent(msg)}`;
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}${query}`);
}
