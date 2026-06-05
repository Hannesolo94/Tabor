// Printful API helpers (server-only; holds PRINTFUL_API_KEY). Used by the admin
// Suppliers sync to import store products into our products table.
//
// Shapes follow Printful's Store Products API:
//   GET /store/products            -> list (id, external_id, name, thumbnail_url, variants count)
//   GET /store/products/{id}       -> { sync_product, sync_variants[] }
const BASE = "https://api.printful.com";

function headers() {
  const key = process.env.PRINTFUL_API_KEY;
  if (!key) throw new Error("PRINTFUL_API_KEY not set");
  const h: Record<string, string> = { Authorization: `Bearer ${key}` };
  const store = process.env.PRINTFUL_STORE_ID;
  if (store) h["X-PF-Store-Id"] = store;
  return h;
}

export interface PrintfulVariant {
  size: string | null;
  color: string | null;
  syncVariantId: number;
  price: number;
}

export interface PrintfulProduct {
  printfulId: number;
  externalId: string | null;
  name: string;
  thumbnail: string | null;
  variants: PrintfulVariant[];
  price: number; // min retail across variants
}

interface ListItem {
  id: number;
  external_id: string | null;
  name: string;
  thumbnail_url: string | null;
}

interface DetailVariant {
  id: number;
  retail_price: string | null;
  size?: string | null;
  color?: string | null;
  files?: { type: string; preview_url?: string | null }[];
  product?: { image?: string | null };
}

async function pf<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), cache: "no-store" });
  const json = await res.json();
  if (json.error) throw new Error(`Printful ${json.code}: ${json.error.message}`);
  return json.result as T;
}

/** List all store products, following paging. */
export async function listStoreProducts(): Promise<ListItem[]> {
  const out: ListItem[] = [];
  let offset = 0;
  const limit = 100;
  // guard against runaway paging
  for (let i = 0; i < 50; i++) {
    const res = await fetch(`${BASE}/store/products?limit=${limit}&offset=${offset}`, { headers: headers(), cache: "no-store" });
    const json = await res.json();
    if (json.error) throw new Error(`Printful ${json.code}: ${json.error.message}`);
    const batch = (json.result ?? []) as ListItem[];
    out.push(...batch);
    const total = json.paging?.total ?? out.length;
    offset += limit;
    if (offset >= total || batch.length === 0) break;
  }
  return out;
}

/** Fetch one product's full variant detail. */
export async function getStoreProduct(id: number): Promise<PrintfulProduct> {
  const detail = await pf<{ sync_product: ListItem; sync_variants: DetailVariant[] }>(`/store/products/${id}`);
  const variants: PrintfulVariant[] = (detail.sync_variants ?? []).map((v) => ({
    size: v.size ?? null,
    color: v.color ?? null,
    syncVariantId: v.id,
    price: Number(v.retail_price ?? 0) || 0,
  }));
  const prices = variants.map((v) => v.price).filter((p) => p > 0);

  // Best available image: the product thumbnail (mockup) first, then a variant's
  // generated "preview" file, then the blank garment image. Printful generates
  // these asynchronously, so a freshly uploaded product may have none yet.
  const v0 = (detail.sync_variants ?? [])[0];
  const previewFile = v0?.files?.find((f) => f.type === "preview")?.preview_url;
  const image = detail.sync_product.thumbnail_url || previewFile || v0?.product?.image || null;

  return {
    printfulId: detail.sync_product.id,
    externalId: detail.sync_product.external_id,
    name: detail.sync_product.name,
    thumbnail: image,
    variants,
    price: prices.length ? Math.min(...prices) : 0,
  };
}

/** Full import: list + per-product detail. */
export async function fetchAllPrintfulProducts(): Promise<PrintfulProduct[]> {
  const list = await listStoreProducts();
  const out: PrintfulProduct[] = [];
  for (const item of list) {
    out.push(await getStoreProduct(item.id));
  }
  return out;
}
