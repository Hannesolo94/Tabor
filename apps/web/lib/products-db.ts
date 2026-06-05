// Server-side product fetchers. The storefront reads live products from the DB
// (status = 'live') so admin edits show up without a redeploy. Catalog taxonomy
// (personas, categories) stays static in catalog.ts.
import { createClient } from "@supabase/supabase-js";
import type { CategoryId, PersonaId, Product } from "./catalog";
import { REGIONS, type RegionId } from "./region";

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
  price_za: number | null;
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

function map(r: Row, region: RegionId): Product {
  const cur = REGIONS[region];
  const price = region === "ZA" && Number(r.price_za) > 0 ? Number(r.price_za) : Number(r.base_price ?? 0);
  return {
    sku: r.sku,
    name: r.name,
    price,
    currencySymbol: cur.symbol,
    currencyCode: cur.code,
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
    // not buyable if out of stock OR misconfigured to a zero/negative price
    inStock: (!r.track_inventory || (r.inventory ?? 0) > 0) && price > 0,
  };
}

const COLS =
  "sku,name,base_price,price_za,collection,category,tagline,note,blurb,description,tone,ink,mark,sizes,featured,image_url,inventory,track_inventory";

export async function getProducts(region: RegionId, filter?: { persona?: string; category?: string; q?: string }): Promise<Product[]> {
  let query = client().from("products").select(COLS).eq("status", "live").order("sort", { ascending: true });
  if (filter?.persona) query = query.eq("collection", filter.persona);
  if (filter?.category) query = query.eq("category", filter.category);
  if (filter?.q) query = query.ilike("name", `%${filter.q}%`);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as Row[]).map((r) => map(r, region));
}

export async function getProductBySku(sku: string, region: RegionId): Promise<Product | null> {
  const { data } = await client().from("products").select(COLS).eq("sku", sku).eq("status", "live").maybeSingle();
  return data ? map(data as Row, region) : null;
}

export async function getFeatured(region: RegionId): Promise<Product[]> {
  const { data } = await client().from("products").select(COLS).eq("status", "live").eq("featured", true).order("sort", { ascending: true });
  return ((data as Row[]) ?? []).map((r) => map(r, region));
}

/** Same persona first, then same category (other personas), excluding self. */
export async function getSuggestions(p: Product, region: RegionId, limit = 4): Promise<Product[]> {
  const all = await getProducts(region);
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
