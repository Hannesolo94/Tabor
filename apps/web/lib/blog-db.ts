// Blog posts (storefront reads published only).
import { createClient } from "@supabase/supabase-js";

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image: string | null;
  author: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

export async function getPublishedPosts(): Promise<Post[]> {
  const { data } = await client().from("posts").select("*").eq("status", "published").order("published_at", { ascending: false });
  return (data as Post[]) ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data } = await client().from("posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return (data as Post) ?? null;
}
