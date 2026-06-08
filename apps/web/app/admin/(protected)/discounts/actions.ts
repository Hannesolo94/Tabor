"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

function fields(formData: FormData) {
  const value_type = String(formData.get("value_type") ?? "percentage");
  return {
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    value_type,
    percent: value_type === "percentage" ? Math.min(100, Math.max(1, Number(formData.get("percent") ?? 10) || 10)) : null,
    amount: value_type === "fixed" ? Math.max(0, Number(formData.get("amount") ?? 0) || 0) : null,
    min_subtotal: formData.get("min_subtotal") ? Number(formData.get("min_subtotal")) : null,
    usage_limit: formData.get("usage_limit") ? Number(formData.get("usage_limit")) : null,
    once_per_email: formData.get("once_per_email") === "on",
    active: formData.get("active") === "on",
    starts_at: formData.get("starts_at") ? new Date(String(formData.get("starts_at"))).toISOString() : null,
    ends_at: formData.get("ends_at") ? new Date(String(formData.get("ends_at"))).toISOString() : null,
    note: String(formData.get("note") ?? "").trim() || null,
    tags: String(formData.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
  };
}

export async function saveDiscount(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const f = fields(formData);
  if (!f.code) return;
  const sb = await supabaseServer();
  if (id) await sb.from("discount_codes").update(f).eq("id", id);
  else await sb.from("discount_codes").insert(f);
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function createDiscount(): Promise<void> {
  const sb = await supabaseServer();
  const code = "CODE-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  const { data } = await sb.from("discount_codes").insert({ code, value_type: "percentage", percent: 10, active: false }).select("id").maybeSingle();
  revalidatePath("/admin/discounts");
  redirect(data?.id ? `/admin/discounts/${data.id}` : "/admin/discounts");
}

export async function deleteDiscount(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("discount_codes").delete().eq("id", id);
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}
