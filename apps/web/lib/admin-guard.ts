// Page-level guard: admin-only sections (Settings, Admins) call this so a
// moderator can't reach them by typing the URL. Moderators are bounced to the
// moderation queue.
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<void> {
  if (!(await isCallerAdmin())) redirect("/admin/moderation");
}

/** Boolean check for use inside server actions (which redirect() shouldn't gate). */
export async function isCallerAdmin(): Promise<boolean> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { data } = await sb.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  return data?.role === "admin";
}

/** The OWNER is the single account that may perform devastating actions: managing
 *  staff, editing API keys, and deleting customer accounts. Admins cannot. */
export async function isCallerOwner(): Promise<boolean> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { data } = await sb.from("profiles").select("is_owner").eq("user_id", user.id).maybeSingle();
  return data?.is_owner === true;
}

/** Page guard: owner-only sections bounce everyone else to the dashboard. */
export async function requireOwner(): Promise<void> {
  if (!(await isCallerOwner())) redirect("/admin");
}
