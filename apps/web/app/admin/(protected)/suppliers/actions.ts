"use server";

// Import products from Printful into our products table. New products arrive as
// DRAFT under a default persona so you can enrich them (assign persona, set live,
// add to bundles) before they show on the site. Re-syncing updates the Printful-
// sourced fields (name, image, price, variants) but PRESERVES your enrichment
// (persona, category, status, featured) so you never lose your curation.
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { fetchAllPrintfulProducts } from "@/lib/printful";
import { slugify } from "@/lib/slug";
import type { SupabaseClient } from "@supabase/supabase-js";

// Find an unused SKU based on a slug (append -2, -3 ... on collision).
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

export interface SyncState {
  ok?: boolean;
  imported?: number;
  updated?: number;
  total?: number;
  error?: string;
}

export async function syncPrintful(_prev: SyncState, _fd: FormData): Promise<SyncState> {
  let products;
  try {
    products = await fetchAllPrintfulProducts();
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }

  const sb = await supabaseServer();
  let imported = 0;
  let updated = 0;

  for (const p of products) {
    const sizes = [...new Set(p.variants.map((v) => v.size).filter((s): s is string => !!s))];
    const pfFields = {
      name: p.name,
      image_url: p.thumbnail,
      base_price: p.price,
      printful_id: String(p.printfulId),
      printful_variants: p.variants,
      sizes,
      source: "printful",
    };

    // Match by Printful product id (stable) so renaming a SKU never dupes.
    const { data: existing } = await sb.from("products").select("sku").eq("printful_id", String(p.printfulId)).maybeSingle();
    if (existing) {
      await sb.from("products").update(pfFields).eq("sku", existing.sku); // keep existing sku
      updated++;
    } else {
      const sku = await uniqueSku(sb, slugify(p.name));
      await sb.from("products").insert({
        sku,
        ...pfFields,
        collection: "sentinel", // default persona; reassign in the editor
        category: "apparel", // default type; reassign in the editor
        status: "draft", // hidden until you publish
        featured: false,
        phase: 1,
        sort: 999,
        blurb: "",
        description: "",
        tagline: "",
        note: "",
        tone: "#15151A",
        ink: "#C9A961",
        mark: "seal",
      });
      imported++;
    }
  }

  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/products");
  return { ok: true, imported, updated, total: products.length };
}
