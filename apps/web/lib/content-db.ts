// Editable site content (hero copy, etc.) from the content table.
import { createClient } from "@supabase/supabase-js";

export interface HeroContent {
  eyebrow: string;
  headline: string;
  subcopy: string;
  bg_type: "none" | "image" | "video";
  bg_url: string;
  cta1_label: string;
  cta1_href: string;
  cta2_label: string;
  cta2_href: string;
}

const HERO_DEFAULT: HeroContent = {
  eyebrow: "Sacred-Tactical Gear",
  headline: "Wear the Climb",
  subcopy: "Heavyweight, muted, premium. Apparel and gear forged for Christian men who train, game, and refuse to drift. Four collections, one brotherhood.",
  bg_type: "none",
  bg_url: "",
  cta1_label: "Shop the Drop",
  cta1_href: "/shop",
  cta2_label: "Find Your Collection",
  cta2_href: "#collections",
};

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
}

export async function getHero(): Promise<HeroContent> {
  const { data } = await client().from("content").select("value").eq("key", "hero_home").maybeSingle();
  return { ...HERO_DEFAULT, ...((data?.value as Partial<HeroContent>) ?? {}) };
}
