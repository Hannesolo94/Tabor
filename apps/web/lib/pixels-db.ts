// Marketing pixel IDs (public — they appear in the page anyway). Set in admin Settings.
import { createClient } from "@supabase/supabase-js";

export interface Pixels {
  meta: string;
  ga4: string;
  gads: string;
  gtm: string;
}

export async function getPixels(): Promise<Pixels> {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data } = await sb.from("app_settings").select("value").eq("key", "pixels").maybeSingle();
  const v = (data?.value ?? {}) as Partial<Pixels>;
  return { meta: v.meta ?? "", ga4: v.ga4 ?? "", gads: v.gads ?? "", gtm: v.gtm ?? "" };
}
