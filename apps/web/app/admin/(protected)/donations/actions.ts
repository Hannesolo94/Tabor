"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function setDonationStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["pending", "completed"].includes(status)) return;
  const sb = await supabaseServer();
  await sb.from("donations").update({ status }).eq("id", id);
  await logAudit("donation.status", "donation", id, { status });
  revalidatePath("/admin/donations");
}

export async function saveGoal(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  const patch = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? ""),
    target_amount: Number(formData.get("target_amount") ?? 0) || 0,
    charity_split_pct: Math.max(0, Math.min(100, Number(formData.get("charity_split_pct") ?? 50) || 50)),
  };
  if (id) await sb.from("donation_goals").update(patch).eq("id", id);
  else await sb.from("donation_goals").insert({ ...patch, active: true });
  revalidatePath("/admin/donations");
  revalidatePath("/give");
}

export async function addCharity(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const sb = await supabaseServer();
  await sb.from("charities").insert({ name, blurb: String(formData.get("blurb") ?? "") || null });
  revalidatePath("/admin/donations");
  revalidatePath("/give");
}

export async function toggleCharity(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  const sb = await supabaseServer();
  await sb.from("charities").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/donations");
  revalidatePath("/give");
}
