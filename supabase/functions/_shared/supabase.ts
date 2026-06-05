// Service-role Supabase client for Edge Functions. Bypasses RLS, so only use
// server-side and scope every query by user explicitly.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/** Resolve the calling user from the Authorization bearer token. */
export async function userFromRequest(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
  );
  const { data, error } = await client.auth.getUser(token);
  if (error) return null;
  return data.user;
}
