// Browser Supabase client (SSR-aware, cookie-based sessions). Public anon key
// only. Used by client components for both public actions (waitlist, promo) and
// admin auth (login). Returns null if env is unset so the build never crashes.
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseBrowser() {
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}

// Convenience singleton for simple client-component usage.
export const supabase = supabaseBrowser();
