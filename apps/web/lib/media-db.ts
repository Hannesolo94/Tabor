// Product media fetcher (storefront). Visible media, ordered.
import { createClient } from "@supabase/supabase-js";

export interface Media {
  id: string;
  sku: string;
  type: "image" | "video";
  url: string;
  alt: string | null;
  source: string;
  sort: number;
  visible: boolean;
}

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
}

export async function getMedia(sku: string, onlyVisible = true): Promise<Media[]> {
  let q = client().from("product_media").select("*").eq("sku", sku).order("sort", { ascending: true });
  if (onlyVisible) q = q.eq("visible", true);
  const { data } = await q;
  return (data as Media[]) ?? [];
}
