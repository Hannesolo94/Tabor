"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

async function setStatus(id: string, status: "approved" | "rejected" | "pending") {
  const sb = await supabaseServer();
  await sb.from("reviews").update({ status }).eq("id", id);
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function approveReview(formData: FormData): Promise<void> {
  await setStatus(String(formData.get("id") ?? ""), "approved");
}
export async function rejectReview(formData: FormData): Promise<void> {
  await setStatus(String(formData.get("id") ?? ""), "rejected");
}
export async function deleteReview(formData: FormData): Promise<void> {
  const sb = await supabaseServer();
  await sb.from("reviews").delete().eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}
