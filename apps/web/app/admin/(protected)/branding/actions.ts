"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Brand } from "@/lib/brand";

export async function saveBrand(brand: Brand): Promise<void> {
  const sb = await supabaseServer();
  await sb.from("app_settings").upsert({ key: "brand", value: brand });
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
