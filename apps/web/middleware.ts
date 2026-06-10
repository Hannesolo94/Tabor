// Two jobs:
//  1) Set the region cookie from Vercel geo (first visit) so prices show in the
//     visitor's currency. Switchable by the user; locked by address at checkout.
//  2) Gate /admin: refresh the Supabase session and bounce anon users to login.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { REGION_COOKIE, regionForCountry } from "@/lib/region";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup", "/admin/auth"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 1) region cookie (set once if missing)
  if (!request.cookies.get(REGION_COOKIE)) {
    const country = request.headers.get("x-vercel-ip-country");
    response.cookies.set(REGION_COOKIE, regionForCountry(country), { path: "/", maxAge: 60 * 60 * 24 * 180 });
  }

  // 2) admin gate (only do the auth round-trip on /admin)
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin")) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && anon) {
      const supabase = createServerClient(url, anon, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(toSet) {
            toSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            if (!request.cookies.get(REGION_COOKIE)) {
              response.cookies.set(REGION_COOKIE, regionForCountry(request.headers.get("x-vercel-ip-country")), { path: "/", maxAge: 60 * 60 * 24 * 180 });
            }
            toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      });
      const { data: { user } } = await supabase.auth.getUser();
      const isPublicAdmin = PUBLIC_ADMIN_PATHS.some((p) => path.startsWith(p));
      if (!isPublicAdmin) {
        if (!user) {
          const redirect = request.nextUrl.clone();
          redirect.pathname = "/admin/login";
          return NextResponse.redirect(redirect);
        }
        // role-aware gating: moderators may only reach the dashboard + community tools
        const { data: prof } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
        const role = prof?.role;
        if (role !== "admin" && role !== "moderator") {
          const r = request.nextUrl.clone(); r.pathname = "/admin/login"; return NextResponse.redirect(r);
        }
        if (role === "moderator") {
          const MOD_PREFIXES = ["/admin/community", "/admin/blog/broadcast", "/admin/moderation", "/admin/tickets", "/admin/giveaways"];
          const allowed = path === "/admin" || MOD_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
          if (!allowed) { const r = request.nextUrl.clone(); r.pathname = "/admin/moderation"; return NextResponse.redirect(r); }
        }
      }
    }
  }

  return response;
}

export const config = {
  // run on storefront + admin, skip static assets and api
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|api/).*)"],
};
