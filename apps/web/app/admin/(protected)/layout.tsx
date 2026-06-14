// Auth + role gate for the admin dashboard. Verifies a logged-in user with
// profiles.role = 'admin'; otherwise bounces to login. Wraps every protected
// admin page in the AdminShell.
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await sb.from("profiles").select("role, name, access").eq("user_id", user.id).maybeSingle();
  const role = profile?.role;
  if (role !== "admin" && role !== "moderator") redirect("/admin/login");

  return (
    <AdminShell email={user.email} name={profile?.name} role={role} access={(profile?.access as string[] | null) ?? []}>
      {children}
    </AdminShell>
  );
}
