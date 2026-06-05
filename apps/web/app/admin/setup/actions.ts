"use server";

// First-run admin password setup. The owner sets their OWN password here; it
// never passes through anyone else. Gated two ways: only the configured
// ADMIN_EMAIL can be targeted, and it self-disables after the first successful
// run (a flag in the content table). Uses the service-role key (server-only).
import { supabaseAdmin } from "@/lib/supabase/admin";

const SETUP_FLAG = "admin_setup_done";

export async function isSetupDone(): Promise<boolean> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("content").select("value").eq("key", SETUP_FLAG).maybeSingle();
  return !!(data?.value as { done?: boolean } | undefined)?.done;
}

export interface SetupState {
  ok: boolean;
  error?: string;
}

export async function setupAdminPassword(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const pw = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (pw.length < 10) return { ok: false, error: "Use at least 10 characters." };
  if (pw !== confirm) return { ok: false, error: "Passwords do not match." };

  if (await isSetupDone()) return { ok: false, error: "Setup is already complete. Use the login page." };

  const email = process.env.ADMIN_EMAIL;
  if (!email) return { ok: false, error: "Admin email not configured." };

  const sb = supabaseAdmin();
  const { data: prof } = await sb.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (!prof?.user_id) return { ok: false, error: "Admin user not found." };

  const { error } = await sb.auth.admin.updateUserById(prof.user_id, { password: pw, email_confirm: true });
  if (error) return { ok: false, error: error.message };

  await sb.from("content").upsert({ key: SETUP_FLAG, value: { done: true } });
  return { ok: true };
}
