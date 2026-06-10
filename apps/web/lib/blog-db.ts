// Blog posts (storefront reads published only). A scheduled post whose time has
// passed counts as published: it goes live the second the clock hits, even before
// the status sweep flips it.
import { createClient } from "@supabase/supabase-js";

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
}

const liveFilter = () => `status.eq.published,and(status.eq.scheduled,scheduled_for.lte.${new Date().toISOString()})`;

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
  scheduled_for: string | null;
  created_at: string;
}

const liveDate = (p: Post) => p.published_at ?? p.scheduled_for ?? p.created_at;

export async function getPublishedPosts(): Promise<Post[]> {
  const { data } = await client().from("posts").select("*").or(liveFilter());
  return ((data as Post[]) ?? []).sort((a, b) => new Date(liveDate(b)).getTime() - new Date(liveDate(a)).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data } = await client().from("posts").select("*").eq("slug", slug).or(liveFilter()).maybeSingle();
  return (data as Post) ?? null;
}
