"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isCallerAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { sendEmail, emailShell } from "@/lib/email";
import { sendExpoPush } from "@/lib/push";

/** Compose a community announcement and fan it out to every user's inbox. */
export async function sendBroadcast(formData: FormData): Promise<void> {
  if (!(await isCallerAdmin())) return; // mass message to every member: admin-only
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const deepLink = String(formData.get("deep_link") ?? "").trim() || null;
  const alsoEmail = formData.get("email") === "on";
  if (!title) return;

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  const admin = supabaseAdmin();
  // every registered user gets the in-app notification
  const { data: profs } = await admin.from("profiles").select("user_id, email");
  const ids = (profs ?? []).map((p) => p.user_id);

  for (let i = 0; i < ids.length; i += 500) {
    const rows = ids.slice(i, i + 500).map((uid) => ({ user_id: uid, kind: "broadcast", title, body, deep_link: deepLink, read: false }));
    if (rows.length) await admin.from("notifications").insert(rows);
  }

  // optionally email it too (requires a Resend key in Settings > Integrations)
  if (alsoEmail) {
    const emails = (profs ?? []).map((p) => p.email).filter((e): e is string => !!e);
    const html = emailShell(title, body.replace(/\n/g, "<br/>"), { eyebrow: "[ ANNOUNCEMENT ]", cta: deepLink ? { label: "Open TABOR", url: deepLink.startsWith("http") ? deepLink : `https://tabor.quest${deepLink}` } : undefined });
    await Promise.allSettled(emails.slice(0, 1000).map((to) => sendEmail(to, title, html)));
  }

  // post it to the global Announcements board so it has a home in the app
  const { data: annCh } = await admin.from("channels").select("id, guild_id").eq("system", "announcements").maybeSingle();
  if (annCh && user) {
    await admin.from("messages").insert({ channel_id: annCh.id, guild_id: annCh.guild_id, author_id: user.id, body: `${title}\n\n${body}`.trim(), kind: "text" });
  }

  // announcements always push to every device (no opt-out, per requirement)
  const { data: toks } = await admin.from("push_tokens").select("token");
  await sendExpoPush((toks ?? []).map((t) => t.token), title, body.slice(0, 140), deepLink ? { route: deepLink } : undefined);

  await admin.from("broadcasts").insert({ title, body, deep_link: deepLink, sent_by: user?.email ?? "admin", audience: ids.length });
  await logAudit("broadcast.send", "broadcast", undefined, { title, audience: ids.length, emailed: alsoEmail });
  revalidatePath("/admin/blog/broadcast");
}

/** Send a test email to the signed-in admin to verify the email provider works. */
export async function sendTestEmail(): Promise<void> {
  if (!(await isCallerAdmin())) return;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) return;
  const res = await sendEmail(user.email, "TABOR email test", emailShell("Email is live", "If you are reading this, your email provider is connected and working. The brotherhood can now reach members by email."));
  await logAudit("email.test", "email", user.email, { ok: res.ok, error: res.error });
  revalidatePath("/admin/blog/broadcast");
}
