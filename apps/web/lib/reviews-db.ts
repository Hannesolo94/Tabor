// Review fetchers (storefront, approved only).
import { createClient } from "@supabase/supabase-js";

export interface ReviewMedia {
  type: "image" | "video";
  url: string;
}
export interface Review {
  id: string;
  sku: string | null;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
  media: ReviewMedia[];
}

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
}

async function attachMedia(reviews: Omit<Review, "media">[]): Promise<Review[]> {
  const ids = reviews.map((r) => r.id);
  if (!ids.length) return reviews.map((r) => ({ ...r, media: [] }));
  const { data } = await client().from("review_media").select("review_id, type, url").in("review_id", ids);
  const byReview = new Map<string, ReviewMedia[]>();
  for (const m of data ?? []) {
    const arr = byReview.get(m.review_id) ?? [];
    arr.push({ type: m.type, url: m.url });
    byReview.set(m.review_id, arr);
  }
  return reviews.map((r) => ({ ...r, media: byReview.get(r.id) ?? [] }));
}

export async function getProductReviews(sku: string): Promise<Review[]> {
  const { data } = await client().from("reviews").select("id, sku, name, rating, title, body, created_at").eq("sku", sku).eq("status", "approved").order("created_at", { ascending: false });
  return attachMedia((data ?? []) as Omit<Review, "media">[]);
}

export async function getReviewSummary(sku: string): Promise<{ count: number; avg: number }> {
  const { data } = await client().from("reviews").select("rating").eq("sku", sku).eq("status", "approved");
  const ratings = (data ?? []).map((r) => r.rating);
  const count = ratings.length;
  const avg = count ? ratings.reduce((a, b) => a + b, 0) / count : 0;
  return { count, avg };
}

/** Recent approved reviews for the home page (UGC with media preferred). */
export async function getHomeReviews(limit = 6): Promise<Review[]> {
  const { data } = await client().from("reviews").select("id, sku, name, rating, title, body, created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(20);
  const withMedia = await attachMedia((data ?? []) as Omit<Review, "media">[]);
  // prefer reviews that have media, then fill with the rest
  const media = withMedia.filter((r) => r.media.length > 0);
  const rest = withMedia.filter((r) => r.media.length === 0);
  return [...media, ...rest].slice(0, limit);
}
