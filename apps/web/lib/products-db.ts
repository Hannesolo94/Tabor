// Server-side product fetchers. The storefront reads live products from the DB
// (status = 'live') so admin edits show up without a redeploy. Catalog taxonomy
// (personas, categories) stays static in catalog.ts.
import { createClient } from "@supabase/supabase-js";
import type { CategoryId, PersonaId, Product } from "./catalog";

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, { auth: { persistSession: false } });
}

// DB row -> Product used by the UI.
interface Row {
  sku: string;
  name: string;
  base_price: number | null;
  collection: string | null;
  category: string | null;
  tagline: string | null;
  note: string | null;
  blurb: string | null;
  description: string | null;
  tone: string | null;
  ink: string | null;
  mark: string | null;
  sizes: string[] | null;
  featured: boolean | null;
  image_url: string | null;
  inventory: number | null;
  track_inventory: boolean | null;
}

function map(r: Row): Product {
  return {
    sku: r.sku,
    name: r.name,
    price: Number(r.base_price ?? 0),
    persona: (r.collection ?? "sentinel") as PersonaId,
    category: (r.category ?? "apparel") as CategoryId,
    tagline: r.tagline ?? "",
    note: r.note ?? "",
    blurb: r.blurb ?? "",
    description: r.description ?? "",
    tone: r.tone ?? "#15151A",
    ink: r.ink ?? "#C9A961",
    mark: (r.mark === "word" ? "word" : "seal"),
    sizes: r.sizes ?? [],
    featured: !!r.featured,
    imageUrl: r.image_url,
    inStock: !r.track_inventory || (r.inventory ?? 0) > 0,
  };
}

const COLS =
  "sku,name,base_price,collection,category,tagline,note,blurb,description,tone,ink,mark,sizes,featured,image_url,inventory,track_inventory";

export async function getProducts(filter?: { persona?: string; category?: string }): Promise<Product[]> {
  let q = client().from("products").select(COLS).eq("status", "live").order("sort", { ascending: true });
  if (filter?.persona) q = q.eq("collection", filter.persona);
  if (filter?.category) q = q.eq("category", filter.category);
  const { data, error } = await q;
  if (error || !data) return [];
  return (data as Row[]).map(map);
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const { data } = await client().from("products").select(COLS).eq("sku", sku).eq("status", "live").maybeSingle();
  return data ? map(data as Row) : null;
}

export async function getFeatured(): Promise<Product[]> {
  const { data } = await client().from("products").select(COLS).eq("status", "live").eq("featured", true).order("sort", { ascending: true });
  return ((data as Row[]) ?? []).map(map);
}

/** Same persona first, then same category (other personas), excluding self. */
export async function getSuggestions(p: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  const samePersona = all.filter((x) => x.sku !== p.sku && x.persona === p.persona);
  const sameCategory = all.filter((x) => x.sku !== p.sku && x.category === p.category && x.persona !== p.persona);
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const x of [...samePersona, ...sameCategory]) {
    if (seen.has(x.sku)) continue;
    seen.add(x.sku);
    out.push(x);
    if (out.length >= limit) break;
  }
  return out;
}
