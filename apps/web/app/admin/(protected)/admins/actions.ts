"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

/** Grant admin to an existing account by email. The person must have signed up
 *  first (app or web) so they have a profile + a password to log in with. */
export async function grantAdmin(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return;
  const admin = supabaseAdmin();
  const { data: prof } = await admin.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (!prof) return; // no account with that email yet
  await admin.from("profiles").update({ role: "admin" }).eq("user_id", prof.user_id);
  await logAudit("admin.grant", "profile", prof.user_id, { email });
  revalidatePath("/admin/admins");
}

/** Revoke admin. Safeguards: cannot demote yourself, and never leave zero admins. */
export async function revokeAdmin(formData: FormData): Promise<void> {
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) return;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (user?.id === userId) return; // never demote yourself
  const admin = supabaseAdmin();
  const { count } = await admin.from("profiles").select("user_id", { count: "exact", head: true }).eq("role", "admin");
  if ((count ?? 0) <= 1) return; // keep at least one admin
  await admin.from("profiles").update({ role: "user" }).eq("user_id", userId);
  await logAudit("admin.revoke", "profile", userId, {});
  revalidatePath("/admin/admins");
}
