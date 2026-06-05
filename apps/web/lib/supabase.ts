// Browser Supabase client. Uses the public anon/publishable key only.
// Server-only secrets (service_role) never touch this file.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During early scaffolding the env may be unset; guard so the build still runs.
export const supabase =
  url && anon ? createClient(url, anon) : null;
