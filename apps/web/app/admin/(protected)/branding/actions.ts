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

export async function uploadDesignFile(formData: FormData): Promise<void> {
  const file = formData.get("file") as File | null;
  const folder = String(formData.get("folder") ?? "").trim() || null;
  const sku = String(formData.get("sku") ?? "").trim() || null;
  if (!file || file.size === 0) return;
  const admin = supabaseAdmin();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from("design-files").upload(path, buf, { contentType: file.type || "application/octet-stream", upsert: false });
  if (error) return;
  await admin.from("design_files").insert({ name: file.name, path, mime: file.type || null, size_bytes: file.size, product_sku: sku, folder });
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
