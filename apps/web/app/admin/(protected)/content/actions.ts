"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function saveHero(formData: FormData): Promise<void> {
  const value = {
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
  revalidatePath("/admin/content");
  revalidatePath("/");
}
