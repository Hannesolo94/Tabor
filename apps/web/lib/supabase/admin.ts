// Service-role Supabase client. Bypasses RLS. SERVER-ONLY. Never import this
// into a client component. Used for privileged admin actions (e.g. first-run
// password setup, future bulk operations).
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
