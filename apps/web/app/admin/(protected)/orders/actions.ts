"use server";

import { revalidatePath } from "next/cache";
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
