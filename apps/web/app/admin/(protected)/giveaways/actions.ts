"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function createGiveaway(formData: FormData): Promise<void> {
  const month = String(formData.get("month") ?? "").trim();
  const prize = String(formData.get("prize") ?? "").trim();
  if (!month || !prize) return;
  const closes = String(formData.get("closes_at") ?? "");
  const sb = await supabaseServer();
  await sb.from("giveaways").insert({
    month, prize,
    product_sku: String(formData.get("product_sku") ?? "") || null,
    closes_at: closes ? new Date(closes).toISOString() : null,
  });
  await logAudit("giveaway.create", "giveaway", month, { prize });
  revalidatePath("/admin/giveaways");
}

export async function deleteGiveaway(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await supabaseServer();
  await sb.from("giveaways").delete().eq("id", id);
  await logAudit("giveaway.delete", "giveaway", id);
  revalidatePath("/admin/giveaways");
}
