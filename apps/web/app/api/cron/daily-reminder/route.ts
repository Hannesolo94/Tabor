// Daily-quest email reminder. Triggered by Vercel Cron once a day. Emails users
// who (a) opted into email quest reminders and (b) have not sealed today's quests.
// Announcements are separate and always sent; this respects the per-user opt-in.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, emailShell } from "@/lib/email";
import { sendExpoPush } from "@/lib/push";
import { promoteDuePosts } from "@/lib/content-schedule";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> when CRON_SECRET is set
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // backstop for the Content Studio: flip any due scheduled posts to published
  await promoteDuePosts().catch(() => 0);

  const admin = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: sealed }, { data: profiles }] = await Promise.all([
    admin.from("day_history").select("user_id").eq("day", today).eq("status", "sealed"),
    admin.from("profiles").select("user_id, name, email, notif_prefs, onboarded"),
  ]);
  const sealedSet = new Set((sealed ?? []).map((s) => s.user_id));

  const recipients = (profiles ?? []).filter((p) => {
    if (!p.email || !p.onboarded) return false;
    if (sealedSet.has(p.user_id)) return false;
    const prefs = (p.notif_prefs ?? {}) as { email?: { quests?: boolean } };
    return prefs.email?.quests === true;
  });

  const html = emailShell(
    "Your daily quest awaits",
    "The day is not yet sealed, brother. Three quests stand between you and the streak. Open TABOR and take the ground.<br/><br/>Scripture. Training. Brotherhood. Win the day.",
    { eyebrow: "[ THE SYSTEM ]", preheader: "The day is not yet sealed. Three quests stand." },
  );
  const results = await Promise.allSettled(recipients.slice(0, 2000).map((p) => sendEmail(p.email as string, "TABOR: your daily quest awaits", html)));
  const sent = results.filter((r) => r.status === "fulfilled" && (r.value as { ok: boolean }).ok).length;

  // push to opted-in users (push.quests, default on) who haven't sealed today
  const pushUserIds = (profiles ?? []).filter((p) => {
    if (!p.onboarded || sealedSet.has(p.user_id)) return false;
    const prefs = (p.notif_prefs ?? {}) as { push?: { quests?: boolean } };
    return prefs.push?.quests !== false;
  }).map((p) => p.user_id);
  let pushed = 0;
  if (pushUserIds.length) {
    const { data: toks } = await admin.from("push_tokens").select("token").in("user_id", pushUserIds);
    pushed = await sendExpoPush((toks ?? []).map((t) => t.token), "Your daily quest awaits", "The day is not sealed. Three quests stand. Open TABOR and take the ground.", { route: "/(tabs)" });
  }

  return NextResponse.json({ ok: true, candidates: recipients.length, sent, pushed });
}
