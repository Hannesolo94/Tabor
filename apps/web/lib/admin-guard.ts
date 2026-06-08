// Page-level guard: admin-only sections (Settings, Admins) call this so a
// moderator can't reach them by typing the URL. Moderators are bounced to the
// moderation queue.
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<void> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data } = await sb.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (data?.role !== "admin") redirect("/admin/moderation");
}
