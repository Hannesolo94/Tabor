// Refreshes the Supabase session cookie on every request and gates /admin.
// Unauthenticated users hitting /admin (except the login/setup/auth routes) are
// redirected to /admin/login. The admin ROLE check happens in the admin layout.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup", "/admin/auth"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isPublicAdmin = PUBLIC_ADMIN_PATHS.some((p) => path.startsWith(p));

  if (isAdmin && !isPublicAdmin && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  // run on admin routes (and let session refresh ride along)
  matcher: ["/admin/:path*"],
};
