// Daily-quest email reminder. Triggered by Vercel Cron once a day. Emails users
// who (a) opted into email quest reminders and (b) have not sealed today's quests.
// Announcements are separate and always sent; this respects the per-user opt-in.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, emailShell } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> when CRON_SECRET is set
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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
  );
  const results = await Promise.allSettled(recipients.slice(0, 2000).map((p) => sendEmail(p.email as string, "TABOR: your daily quest awaits", html)));
  const sent = results.filter((r) => r.status === "fulfilled" && (r.value as { ok: boolean }).ok).length;

  return NextResponse.json({ ok: true, candidates: recipients.length, sent });
}
