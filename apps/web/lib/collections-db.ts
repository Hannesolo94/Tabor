// Custom collections + persona visibility (storefront reads).
import { createClient } from "@supabase/supabase-js";
import { PERSONAS, type Persona } from "./catalog";
import { getProducts } from "./products-db";
import type { Product } from "./catalog";
import type { RegionId } from "./region";

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  visible: boolean;
  sort: number;
}

export async function getVisibleCollections(): Promise<Collection[]> {
  const { data } = await client().from("collections").select("*").eq("visible", true).order("sort", { ascending: true });
  return (data as Collection[]) ?? [];
}

export async function getCollectionBySlug(slug: string, region: RegionId): Promise<{ collection: Collection; products: Product[] } | null> {
  const { data: col } = await client().from("collections").select("*").eq("slug", slug).eq("visible", true).maybeSingle();
  if (!col) return null;
  const { data: members } = await client().from("collection_products").select("sku").eq("collection_id", col.id).order("sort", { ascending: true });
  const skus = (members ?? []).map((m) => m.sku);
  if (skus.length === 0) return { collection: col as Collection, products: [] };
  // pull all live products for the region, keep those in this collection, preserve order
  const all = await getProducts(region);
  const bySku = new Map(all.map((p) => [p.sku, p]));
  const products = skus.map((s) => bySku.get(s)).filter((p): p is Product => !!p);
  return { collection: col as Collection, products };
}

/** Persona ids the admin has hidden (from app_settings). */
export async function getHiddenPersonas(): Promise<string[]> {
  const { data } = await client().from("app_settings").select("value").eq("key", "personas").maybeSingle();
  const hidden = (data?.value as { hidden?: string[] } | undefined)?.hidden;
  return Array.isArray(hidden) ? hidden : [];
}

export async function getVisiblePersonas(): Promise<Persona[]> {
  const hidden = await getHiddenPersonas();
  return PERSONAS.filter((p) => !hidden.includes(p.id));
}
