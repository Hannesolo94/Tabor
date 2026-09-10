"use server";

// Settings actions. Store config + integration keys live in the DB (admin-only
// for secrets). Core infra keys are NOT editable here — they stay in the
// deployment env for security.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isCallerOwner } from "@/lib/admin-guard";
import { slugify } from "@/lib/slug";
import { sanitizePixels } from "@/lib/pixels-db";
import { logAudit } from "@/lib/audit";

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
  await logAudit("settings.update", "settings", "store");
  revalidatePath("/admin/settings");
}

export async function savePixels(formData: FormData): Promise<void> {
  const value = sanitizePixels({
    meta: String(formData.get("meta") ?? ""),
    ga4: String(formData.get("ga4") ?? ""),
    gads: String(formData.get("gads") ?? ""),
    gtm: String(formData.get("gtm") ?? ""),
  });
  const sb = await supabaseServer();
  await sb.from("app_settings").upsert({ key: "pixels", value, updated_at: new Date().toISOString() });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function saveIntegration(formData: FormData): Promise<void> {
  // Was a silent `return`: if the owner check failed the form appeared to save
  // and nothing happened, with no way to tell. Say so instead.
  if (!(await isCallerOwner())) redirect("/admin/settings?err=not-owner");
  const provider = String(formData.get("provider") ?? "");
  if (!provider) redirect("/admin/settings?err=no-provider");
  const patch: Record<string, unknown> = {
    enabled: formData.get("enabled") === "on",
    updated_at: new Date().toISOString(),
  };
  // Only overwrite the secret if a new value was entered (blank = keep existing).
  const secret = String(formData.get("secret") ?? "").trim();
  if (secret && secret !== "********") patch.secret = secret;

  const sb = await supabaseServer();
  const { data, error } = await sb.from("integrations").update(patch).eq("provider", provider).select("provider");
  if (error) redirect(`/admin/settings?err=${encodeURIComponent(error.message.slice(0, 80))}`);
  // An update that matches no row is not an error in PostgREST, so check.
  if (!data?.length) redirect("/admin/settings?err=no-such-integration");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function addIntegration(formData: FormData): Promise<void> {
  if (!(await isCallerOwner())) redirect("/admin/settings?err=not-owner");
  const label = String(formData.get("label") ?? "").trim();
  const secret = String(formData.get("secret") ?? "").trim();
  if (!label) redirect("/admin/settings?err=name-required");
  const provider = slugify(label);
  const sb = await supabaseServer();
  const { error } = await sb.from("integrations").upsert({ provider, label, secret: secret || null, enabled: !!secret, updated_at: new Date().toISOString() });
  if (error) redirect(`/admin/settings?err=${encodeURIComponent(error.message.slice(0, 80))}`);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
