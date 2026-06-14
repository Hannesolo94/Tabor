"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isCallerAdmin } from "@/lib/admin-guard";
import { sendEmail, emailShell } from "@/lib/email";
import { logAudit } from "@/lib/audit";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tabor.quest";

export interface InviteResult { ok: boolean; message: string }

/** Invite (or promote) staff by email. If the person already has an account, this
 *  just sets their role. If not, it CREATES the account with a temporary password,
 *  sets the role, and emails them sign-in details via Resend (our verified sender,
 *  so it actually lands — Supabase's own auth email is not configured). */
export async function inviteStaff(_prev: InviteResult | null, formData: FormData): Promise<InviteResult> {
  if (!(await isCallerAdmin())) return { ok: false, message: "Not authorized." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "admin");
  if (!email.includes("@") || !["admin", "moderator"].includes(role)) return { ok: false, message: "Enter a valid email and role." };
  const admin = supabaseAdmin();
  const roleLabel = role === "admin" ? "Admin" : "Moderator";
  const loginUrl = `${SITE}/admin/login`;

  // already has an account -> just set the role and let them know
  const { data: prof } = await admin.from("profiles").select("user_id").eq("email", email).maybeSingle();
  if (prof) {
    await admin.from("profiles").update({ role }).eq("user_id", prof.user_id);
    await logAudit("staff.grant", "profile", prof.user_id, { email, role });
    await sendEmail(email, `You're now ${roleLabel} on TABOR`,
      emailShell("You've been given the keys",
        `You now have <strong>${roleLabel}</strong> access to the TABOR command deck. Sign in with your existing account.`,
        { eyebrow: "[ THE COUNCIL ]", cta: { label: "Open the dashboard", url: loginUrl }, preheader: "Your TABOR staff access is ready." }));
    revalidatePath("/admin/admins");
    return { ok: true, message: `${email} is now ${roleLabel}. A confirmation email was sent.` };
  }

  // no account yet -> create one (confirmed) with a temporary password, set the role, email it
  const tempPassword = randomBytes(9).toString("base64url"); // ~12 chars, strong
  const { data: created, error } = await admin.auth.admin.createUser({ email, password: tempPassword, email_confirm: true });
  if (error || !created?.user) {
    await logAudit("staff.invite_failed", "profile", undefined, { email, error: error?.message });
    return { ok: false, message: error?.message ?? "Could not create the account." };
  }
  // the on_auth_user_created trigger makes the profile (user_id, name) only; set email + role
  await admin.from("profiles").update({ email, role }).eq("user_id", created.user.id);
  await logAudit("staff.invite", "profile", created.user.id, { email, role });

  const sent = await sendEmail(email, `You've been invited to TABOR as ${roleLabel}`,
    emailShell("Welcome to the command deck",
      `You've been added to the TABOR back office as <strong>${roleLabel}</strong>.<br/><br/>` +
      `Sign in with:<br/>Email: <strong>${email}</strong><br/>` +
      `Temporary password: <strong style="font-family:monospace;font-size:16px;color:#C9A961;letter-spacing:1px">${tempPassword}</strong><br/><br/>` +
      `Use it to sign in, then change it from your account. Keep this email private.`,
      { eyebrow: "[ THE COUNCIL ]", cta: { label: "Sign in", url: loginUrl }, preheader: "Your TABOR staff access is ready." }));
  revalidatePath("/admin/admins");
  return sent.ok
    ? { ok: true, message: `Invited ${email} as ${roleLabel}. Sign-in details emailed.` }
    : { ok: true, message: `Account created for ${email} as ${roleLabel}, but the email failed (${sent.error}). Share the temporary password: ${tempPassword}` };
}

/** Revoke admin. Safeguards: cannot demote yourself, and never leave zero admins. */
export async function revokeAdmin(formData: FormData): Promise<void> {
  if (!(await isCallerAdmin())) return; // only admins may revoke roles
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
