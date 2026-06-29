"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function saveHero(formData: FormData): Promise<void> {
  const value = {
    logo_url: String(formData.get("logo_url") ?? "").trim(),
    logo_height: Number(formData.get("logo_height")) || 96,
    eyebrow: String(formData.get("eyebrow") ?? ""),
    headline: String(formData.get("headline") ?? ""),
    subcopy: String(formData.get("subcopy") ?? ""),
    bg_type: String(formData.get("bg_type") ?? "none"),
    bg_url: String(formData.get("bg_url") ?? "").trim(),
    cta1_label: String(formData.get("cta1_label") ?? ""),
    cta1_href: String(formData.get("cta1_href") ?? ""),
    cta2_label: String(formData.get("cta2_label") ?? ""),
    cta2_href: String(formData.get("cta2_href") ?? ""),
  };
  const sb = await supabaseServer();
  await sb.from("content").upsert({ key: "hero_home", value });
  await logAudit("content.hero", "content", "hero_home");
  revalidatePath("/admin/content");
  revalidatePath("/");
}
