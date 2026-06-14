"use server";

// Self-service password change for any signed-in staff member. Verifies the current
// password (a fresh sign-in attempt) before updating, so an unattended open session
// can't be used to silently take over the account.
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export interface PwResult { ok: boolean; message: string }

export async function changePassword(_prev: PwResult | null, formData: FormData): Promise<PwResult> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) return { ok: false, message: "You are not signed in." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next.length < 10) return { ok: false, message: "New password must be at least 10 characters." };
  if (next !== confirm) return { ok: false, message: "New passwords do not match." };
  if (next === current) return { ok: false, message: "New password must be different from the current one." };

  // verify the current password with a throwaway (non-persisted) sign-in
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { ok: false, message: "Auth not configured." };
  const check = createClient(url, anon, { auth: { persistSession: false } });
  const { error: badCurrent } = await check.auth.signInWithPassword({ email: user.email, password: current });
  if (badCurrent) return { ok: false, message: "Your current password is incorrect." };

  const { error } = await sb.auth.updateUser({ password: next });
  if (error) return { ok: false, message: error.message };
  await logAudit("staff.password_change", "profile", user.id);
  return { ok: true, message: "Password changed. Use the new one next time you sign in." };
}
