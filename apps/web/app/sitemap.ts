import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CATEGORIES, PERSONAS } from "@/lib/catalog";

export const revalidate = 3600; // refresh hourly

const BASE = "https://tabor.quest";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1 },
    { url: `${BASE}/shop`, priority: 0.8 },
    { url: `${BASE}/privacy`, priority: 0.3 },
    { url: `${BASE}/terms`, priority: 0.3 },
    { url: `${BASE}/returns`, priority: 0.3 },
    { url: `${BASE}/shipping`, priority: 0.3 },
  ];
  const collections: MetadataRoute.Sitemap = PERSONAS.map((p) => ({ url: `${BASE}/collections/${p.id}`, priority: 0.8 }));
  const categories: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({ url: `${BASE}/shop?type=${c.id}`, priority: 0.6 }));

  let products: MetadataRoute.Sitemap = [];
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    const { data } = await sb.from("products").select("sku").eq("status", "live");
    products = (data ?? []).map((p) => ({ url: `${BASE}/product/${p.sku}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  } catch {
    /* sitemap still returns statics */
  }

  return [...statics, ...collections, ...categories, ...products];
}
