// Server-side product fetchers. The storefront reads live products from the DB
// (status = 'live') so admin edits show up without a redeploy. Catalog taxonomy
// (personas, categories) stays static in catalog.ts.
import { createClient } from "@supabase/supabase-js";
import type { CategoryId, PersonaId, Product } from "./catalog";
import { priceFor, type PriceContext } from "./pricing";

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

function map(r: Row, ctx: PriceContext): Product {
  const price = priceFor(r.sku, r.base_price, ctx);
  return {
    sku: r.sku,
    name: r.name,
    price,
    currencySymbol: ctx.symbol,
    currencyCode: ctx.currency,
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
  "sku,name,base_price,collection,category,tagline,note,blurb,description,tone,ink,mark,sizes,featured,image_url,inventory,track_inventory";

export async function getProducts(ctx: PriceContext, filter?: { persona?: string; category?: string; q?: string }): Promise<Product[]> {
  let query = client().from("products").select(COLS).eq("status", "live").order("sort", { ascending: true }).order("sku", { ascending: true });
  if (filter?.persona) query = query.eq("collection", filter.persona);
  if (filter?.category) query = query.eq("category", filter.category);
  if (filter?.q) query = query.ilike("name", `%${filter.q}%`);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as Row[]).map((r) => map(r, ctx));
}

export async function getProductBySku(sku: string, ctx: PriceContext): Promise<Product | null> {
  const { data } = await client().from("products").select(COLS).eq("sku", sku).eq("status", "live").maybeSingle();
  return data ? map(data as Row, ctx) : null;
}

export async function getFeatured(ctx: PriceContext): Promise<Product[]> {
  const { data } = await client().from("products").select(COLS).eq("status", "live").eq("featured", true).order("sort", { ascending: true }).order("sku", { ascending: true });
  return ((data as Row[]) ?? []).map((r) => map(r, ctx));
}

/** Same persona first, then same category (other personas), excluding self. */
export async function getSuggestions(p: Product, ctx: PriceContext, limit = 4): Promise<Product[]> {
  const all = await getProducts(ctx);
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
