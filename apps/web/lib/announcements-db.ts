// Announcement bar cycles.
import { createClient } from "@supabase/supabase-js";

export interface Announcement {
  id: string;
  text: string;
  link: string | null;
  bg_color: string;
  text_color: string;
  bg_image_url: string | null;
  font: string;
  sort: number;
  enabled: boolean;
}

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
}

export async function getAnnouncements(onlyEnabled = true): Promise<Announcement[]> {
  let q = client().from("announcements").select("*").order("sort", { ascending: true });
  if (onlyEnabled) q = q.eq("enabled", true);
  const { data } = await q;
  return (data as Announcement[]) ?? [];
}

export const FONT_VAR: Record<string, string> = {
  mono: "var(--font-mono), monospace",
  cinzel: "var(--font-cinzel), serif",
  inter: "var(--font-inter), sans-serif",
  pirata: "var(--font-pirata), serif",
  cormorant: "var(--font-cormorant), serif",
};
