"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Brand, BrandLogos } from "@/lib/brand";

export async function saveBrand(brand: Brand): Promise<void> {
  const sb = await supabaseServer();
  // Logos are owned by the LogoManager; never let a stale BrandStudio draft overwrite them.
  const { data } = await sb.from("app_settings").select("value").eq("key", "brand").maybeSingle();
  const logos = (data?.value as Partial<Brand> | undefined)?.logos ?? { icon: null, wordmark: null };
  await sb.from("app_settings").upsert({ key: "brand", value: { ...brand, logos } });
  revalidatePath("/admin/branding");
}

/** Mint a signed upload URL for a logo image, targeting the PUBLIC product-media bucket
 *  (so the live site can read it without signing). Returns the eventual public URL too. */
export async function createLogoUploadTicket(name: string, slot: "icon" | "wordmark"): Promise<{ path: string; token: string; publicUrl: string } | { error: string }> {
  const admin = supabaseAdmin();
  const ext = (name.includes(".") ? name.split(".").pop() : "png")!.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `brand/${slot}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await admin.storage.from("product-media").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not start the upload." };
  const { data: pub } = admin.storage.from("product-media").getPublicUrl(path);
  return { path: data.path, token: data.token, publicUrl: pub.publicUrl };
}

/** Merge logo URLs into the brand settings, then refresh the whole public site + admin so
 *  the new logo/icon shows everywhere immediately. Pass null in a slot to clear it. */
export async function saveLogos(logos: BrandLogos): Promise<void> {
  const sb = await supabaseServer();
  const { data } = await sb.from("app_settings").select("value").eq("key", "brand").maybeSingle();
  const current = (data?.value ?? {}) as Record<string, unknown>;
  await sb.from("app_settings").upsert({ key: "brand", value: { ...current, logos } });
  revalidatePath("/", "layout"); // every storefront page (header/footer/favicon)
  revalidatePath("/admin/branding");
}

/** Step 1: mint a one-time signed upload URL so the browser uploads the (possibly large)
 *  file DIRECTLY to Supabase — bypassing the 1MB server-action / ~4.5MB Vercel body limits. */
export async function createUploadTicket(name: string): Promise<{ path: string; token: string } | { error: string }> {
  const admin = supabaseAdmin();
  const ext = name.includes(".") ? name.split(".").pop() : "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await admin.storage.from("design-files").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not start the upload." };
  return { path: data.path, token: data.token };
}

/** Step 2: after the browser finishes the direct upload, record the file's metadata. */
export async function recordDesignFile(input: { name: string; path: string; mime: string | null; size: number; sku: string | null; scope: string | null; folder: string | null; notes: string | null }): Promise<void> {
  const admin = supabaseAdmin();
  await admin.from("design_files").insert({ name: input.name, path: input.path, mime: input.mime, size_bytes: input.size, product_sku: input.sku || null, scope: input.scope || null, folder: input.folder || null, notes: input.notes || null });
  revalidatePath("/admin/branding");
}

export async function deleteDesignFile(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "");
  if (!id) return;
  const admin = supabaseAdmin();
  if (path) await admin.storage.from("design-files").remove([path]);
  await admin.from("design_files").delete().eq("id", id);
  revalidatePath("/admin/branding");
}
