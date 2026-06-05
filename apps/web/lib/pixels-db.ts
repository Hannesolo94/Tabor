// Marketing pixel IDs (public — they appear in the page anyway). Set in admin Settings.
import { createClient } from "@supabase/supabase-js";

export interface Pixels {
  meta: string;
  ga4: string;
  gads: string;
  gtm: string;
}

// Strict shapes — anything else is dropped, so a value can never break out of
// the inline script (XSS hardening).
const PATTERNS = {
  meta: /^\d{6,20}$/,
  ga4: /^G-[A-Z0-9]{4,20}$/i,
  gads: /^AW-[A-Z0-9]{4,20}$/i,
  gtm: /^GTM-[A-Z0-9]{4,20}$/i,
};

export function sanitizePixels(raw: Partial<Pixels>): Pixels {
  const ok = (key: keyof Pixels) => {
    const v = (raw[key] ?? "").trim();
    return PATTERNS[key].test(v) ? v : "";
  };
  return { meta: ok("meta"), ga4: ok("ga4"), gads: ok("gads"), gtm: ok("gtm") };
}

export async function getPixels(): Promise<Pixels> {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data } = await sb.from("app_settings").select("value").eq("key", "pixels").maybeSingle();
  return sanitizePixels((data?.value ?? {}) as Partial<Pixels>);
}
