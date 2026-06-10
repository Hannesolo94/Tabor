"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

export async function createBundle(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const sb = await supabaseServer();
  let slug = slugify(title);
  for (let i = 2; i < 50; i++) {
    const { data } = await sb.from("bundles").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${slugify(title)}-${i}`;
  }
  const { data } = await sb.from("bundles").insert({
    title, slug,
    description: String(formData.get("description") ?? "") || null,
    discount_percent: Math.max(0, Math.min(90, Number(formData.get("discount_percent") ?? 0) || 0)),
  }).select("id").single();
  revalidatePath("/admin/bundles");
  revalidatePath("/");
  if (data?.id) redirect(`/admin/bundles/${data.id}`);
}

export async function updateBundle(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("bundles").update({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "") || null,
    discount_percent: Math.max(0, Math.min(90, Number(formData.get("discount_percent") ?? 0) || 0)),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    visible: formData.get("visible") === "on",
    sort: Number(formData.get("sort") ?? 0) || 0,
  }).eq("id", id);
  revalidatePath("/admin/bundles");
  revalidatePath(`/admin/bundles/${id}`);
  revalidatePath("/");
}

export async function deleteBundle(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("bundles").delete().eq("id", id);
  await logAudit("bundle.delete", "bundle", id);
  revalidatePath("/admin/bundles");
  revalidatePath("/");
  redirect("/admin/bundles");
}

/** Bulk-set which products are in a bundle (the picker). */
export async function setBundleProducts(bundleId: string, skus: string[]): Promise<void> {
  const sb = await supabaseServer();
  await sb.from("bundle_products").delete().eq("bundle_id", bundleId);
  if (skus.length) {
    await sb.from("bundle_products").insert(skus.map((sku, i) => ({ bundle_id: bundleId, sku, sort: i })));
  }
  revalidatePath(`/admin/bundles/${bundleId}`);
  revalidatePath("/");
}
