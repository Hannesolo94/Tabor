"use server";

// Product write actions (admin only). Writes go through the admin's RLS-authed
// session; the products_admin_write policy (is_admin()) authorizes them. The
// storefront is force-dynamic, so edits show up immediately with no redeploy.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface SaveState {
  error?: string;
}

async function uniqueSku(sb: SupabaseClient, base: string): Promise<string> {
  let sku = base;
  let n = 2;
  for (let i = 0; i < 100; i++) {
    const { data } = await sb.from("products").select("sku").eq("sku", sku).maybeSingle();
    if (!data) return sku;
    sku = `${base}-${n++}`;
  }
  return `${base}-${Date.now()}`;
}

function parseSizes(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function saveProduct(_prev: SaveState, formData: FormData): Promise<SaveState> {
  let sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const sb = await supabaseServer();

  // Auto-generate a clean SKU from the name when left blank.
  if (!sku) {
    sku = await uniqueSku(sb, slugify(name));
  } else if (!/^[a-z0-9-]+$/.test(sku)) {
    return { error: "SKU may use only lowercase letters, numbers, and dashes (or leave blank to auto-generate)." };
  }

  const row = {
    sku,
    name,
    collection: String(formData.get("collection") ?? "sentinel"),
    category: String(formData.get("category") ?? "apparel"),
    base_price: Number(formData.get("base_price") ?? 0) || 0,
    cost: Number(formData.get("cost") ?? 0) || 0,
    description: String(formData.get("description") ?? ""),
    blurb: String(formData.get("blurb") ?? ""),
    note: String(formData.get("note") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    tone: String(formData.get("tone") ?? "#15151A"),
    ink: String(formData.get("ink") ?? "#C9A961"),
    mark: String(formData.get("mark") ?? "seal"),
    sizes: parseSizes(String(formData.get("sizes") ?? "")),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    status: formData.get("status") === "live" ? "live" : "draft",
    featured: formData.get("featured") === "on",
    track_inventory: formData.get("track_inventory") === "on",
    inventory: Number(formData.get("inventory") ?? 0) || 0,
    sort: Number(formData.get("sort") ?? 0) || 0,
  };

  const { error } = await sb.from("products").upsert(row, { onConflict: "sku" });
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const sku = String(formData.get("sku") ?? "");
  const sb = await supabaseServer();
  await sb.from("products").delete().eq("sku", sku);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// Bulk edit: apply one field change to many selected products at once.
export async function bulkUpdate(formData: FormData): Promise<void> {
  const skus = formData.getAll("skus").map(String).filter(Boolean);
  const field = String(formData.get("field") ?? "");
  const value = String(formData.get("value") ?? "");
  if (!skus.length) return;

  let patch: Record<string, unknown> | null = null;
  if (field === "collection") patch = { collection: value };
  else if (field === "category") patch = { category: value };
  else if (field === "status") patch = { status: value === "live" ? "live" : "draft" };
  else if (field === "featured") patch = { featured: value === "true" };
  if (!patch) return;

  const sb = await supabaseServer();
  await sb.from("products").update(patch).in("sku", skus);
  revalidatePath("/admin/products");
}

// Quick toggles from the list (live/draft, featured).
export async function toggleField(formData: FormData): Promise<void> {
  const sku = String(formData.get("sku") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = formData.get("value") === "true";
  if (!["featured"].includes(field) && field !== "status") return;
  const sb = await supabaseServer();
  const patch = field === "status" ? { status: value ? "live" : "draft" } : { [field]: value };
  await sb.from("products").update(patch).eq("sku", sku);
  revalidatePath("/admin/products");
}
