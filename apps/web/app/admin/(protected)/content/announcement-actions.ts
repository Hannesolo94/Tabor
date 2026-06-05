"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

function fields(formData: FormData) {
  return {
    text: String(formData.get("text") ?? "").trim(),
    link: String(formData.get("link") ?? "").trim() || null,
    bg_color: String(formData.get("bg_color") ?? "#0C0C10"),
    text_color: String(formData.get("text_color") ?? "#C9A961"),
    bg_image_url: String(formData.get("bg_image_url") ?? "").trim() || null,
    font: String(formData.get("font") ?? "mono"),
    sort: Number(formData.get("sort") ?? 0) || 0,
    enabled: formData.get("enabled") === "on",
  };
}

export async function saveAnnouncement(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const f = fields(formData);
  if (!f.text) return;
  const sb = await supabaseServer();
  if (id) await sb.from("announcements").update(f).eq("id", id);
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function addAnnouncement(formData: FormData): Promise<void> {
  const f = fields(formData);
  if (!f.text) return;
  const sb = await supabaseServer();
  await sb.from("announcements").insert(f);
  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function deleteAnnouncement(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("announcements").delete().eq("id", id);
  revalidatePath("/admin/content");
  revalidatePath("/");
}
