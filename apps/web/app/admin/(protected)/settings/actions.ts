"use server";

// Settings actions. Store config + integration keys live in the DB (admin-only
// for secrets). Core infra keys are NOT editable here — they stay in the
// deployment env for security.
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function saveStore(formData: FormData): Promise<void> {
  const value = {
    name: String(formData.get("name") ?? "TABOR"),
    support_email: String(formData.get("support_email") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    tiktok: String(formData.get("tiktok") ?? ""),
    x: String(formData.get("x") ?? ""),
    promo_code: String(formData.get("promo_code") ?? "").toUpperCase(),
    promo_percent: Number(formData.get("promo_percent") ?? 10) || 10,
  };
  const sb = await supabaseServer();
  await sb.from("app_settings").upsert({ key: "store", value, updated_at: new Date().toISOString() });
  revalidatePath("/admin/settings");
}

export async function savePixels(formData: FormData): Promise<void> {
  const value = {
    meta: String(formData.get("meta") ?? "").trim(),
    ga4: String(formData.get("ga4") ?? "").trim(),
    gads: String(formData.get("gads") ?? "").trim(),
    gtm: String(formData.get("gtm") ?? "").trim(),
  };
  const sb = await supabaseServer();
  await sb.from("app_settings").upsert({ key: "pixels", value, updated_at: new Date().toISOString() });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function saveIntegration(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider") ?? "");
  if (!provider) return;
  const patch: Record<string, unknown> = {
    enabled: formData.get("enabled") === "on",
    updated_at: new Date().toISOString(),
  };
  // Only overwrite the secret if a new value was entered (blank = keep existing).
  const secret = String(formData.get("secret") ?? "").trim();
  if (secret && secret !== "********") patch.secret = secret;

  const sb = await supabaseServer();
  await sb.from("integrations").update(patch).eq("provider", provider);
  revalidatePath("/admin/settings");
}

export async function addIntegration(formData: FormData): Promise<void> {
  const label = String(formData.get("label") ?? "").trim();
  const secret = String(formData.get("secret") ?? "").trim();
  if (!label) return;
  const provider = slugify(label);
  const sb = await supabaseServer();
  await sb.from("integrations").upsert({ provider, label, secret: secret || null, enabled: !!secret, updated_at: new Date().toISOString() });
  revalidatePath("/admin/settings");
}
