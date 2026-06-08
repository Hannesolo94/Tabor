"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

export async function createCollection(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const sb = await supabaseServer();
  // unique slug
  let slug = slugify(title);
  for (let i = 2; i < 50; i++) {
    const { data } = await sb.from("collections").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${slugify(title)}-${i}`;
  }
  const { data } = await sb.from("collections").insert({ title, slug, description: String(formData.get("description") ?? "") || null }).select("id").single();
  revalidatePath("/admin/collections");
  revalidatePath("/");
  if (data?.id) redirect(`/admin/collections/${data.id}`);
}

export async function updateCollection(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("collections").update({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "") || null,
    visible: formData.get("visible") === "on",
    sort: Number(formData.get("sort") ?? 0) || 0,
  }).eq("id", id);
  revalidatePath("/admin/collections");
  revalidatePath(`/admin/collections/${id}`);
  revalidatePath("/");
}

export async function deleteCollection(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("collections").delete().eq("id", id);
  await logAudit("collection.delete", "collection", id);
  revalidatePath("/admin/collections");
  revalidatePath("/");
  redirect("/admin/collections");
}

/** Bulk-set which products are in a collection (the picker). */
export async function setCollectionProducts(collectionId: string, skus: string[]): Promise<void> {
  const sb = await supabaseServer();
  await sb.from("collection_products").delete().eq("collection_id", collectionId);
  if (skus.length) {
    await sb.from("collection_products").insert(skus.map((sku, i) => ({ collection_id: collectionId, sku, sort: i })));
  }
  revalidatePath(`/admin/collections/${collectionId}`);
  revalidatePath("/");
}

/** Hide/unhide a persona collection (stored in app_settings). */
export async function togglePersona(formData: FormData): Promise<void> {
  const persona = String(formData.get("persona") ?? "");
  const sb = await supabaseServer();
  const { data } = await sb.from("app_settings").select("value").eq("key", "personas").maybeSingle();
  const hidden: string[] = ((data?.value as { hidden?: string[] } | undefined)?.hidden) ?? [];
  const next = hidden.includes(persona) ? hidden.filter((h) => h !== persona) : [...hidden, persona];
  await sb.from("app_settings").upsert({ key: "personas", value: { hidden: next } });
  revalidatePath("/admin/collections");
  revalidatePath("/");
}

/** Hide/unhide a product-type (category) collection (stored in app_settings). */
export async function toggleCategory(formData: FormData): Promise<void> {
  const category = String(formData.get("category") ?? "");
  const sb = await supabaseServer();
  const { data } = await sb.from("app_settings").select("value").eq("key", "categories").maybeSingle();
  const hidden: string[] = ((data?.value as { hidden?: string[] } | undefined)?.hidden) ?? [];
  const next = hidden.includes(category) ? hidden.filter((h) => h !== category) : [...hidden, category];
  await sb.from("app_settings").upsert({ key: "categories", value: { hidden: next } });
  revalidatePath("/admin/collections");
  revalidatePath("/");
}
