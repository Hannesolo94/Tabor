"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

function fields(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const percent = Math.min(100, Math.max(1, Number(formData.get("percent") ?? 10) || 10));
  return {
    code,
    percent,
    active: formData.get("active") === "on",
    usage_limit: formData.get("usage_limit") ? Number(formData.get("usage_limit")) : null,
    once_per_email: formData.get("once_per_email") === "on",
    note: String(formData.get("note") ?? "").trim() || null,
  };
}

export async function saveDiscount(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const f = fields(formData);
  if (!f.code) return;
  const sb = await supabaseServer();
  if (id) await sb.from("discount_codes").update(f).eq("id", id);
  revalidatePath("/admin/discounts");
}

export async function addDiscount(formData: FormData): Promise<void> {
  const f = fields(formData);
  if (!f.code) return;
  const sb = await supabaseServer();
  await sb.from("discount_codes").insert(f);
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("discount_codes").delete().eq("id", id);
  revalidatePath("/admin/discounts");
}
