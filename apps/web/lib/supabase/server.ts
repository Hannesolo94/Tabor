// Server Supabase client (reads the user's session from cookies). Use in server
// components / route handlers / server actions. Honors RLS as the logged-in user
// (so admin pages read admin-only rows via the is_admin() policies).
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // called from a Server Component without a writable cookie store; ignore.
        }
      },
    },
  });
}
