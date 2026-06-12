// Daily digest of new in-app bug/feature reports, emailed to the team so nothing
// slips through. Triggered by Vercel Cron.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, emailShell } from "@/lib/email";

export const dynamic = "force-dynamic";
const TEAM_EMAIL = "haasrx@gmail.com";

export async function GET(req: Request) {
  // fail closed: require the cron secret (Vercel injects it on scheduled calls)
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = supabaseAdmin();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data } = await admin.from("bug_reports").select("kind, title, body, device, status, created_at").gte("created_at", since).order("created_at", { ascending: false });
  const reports = data ?? [];
  if (reports.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const rows = reports.map((r) => `<tr><td style="padding:6px 10px;border-bottom:1px solid #2a2a2a"><strong>${r.kind === "bug" ? "BUG" : "FEATURE"}</strong></td><td style="padding:6px 10px;border-bottom:1px solid #2a2a2a">${escapeHtml(r.title)}<br/><span style="color:#888;font-size:12px">${escapeHtml(r.body ?? "")}</span></td><td style="padding:6px 10px;border-bottom:1px solid #2a2a2a;color:#888;font-size:12px">${r.device ?? ""}</td></tr>`).join("");
  const html = emailShell(
    `${reports.length} new report${reports.length === 1 ? "" : "s"}`,
    `New bug and feature reports from the app in the last 24 hours.<br/><br/><table style="width:100%;border-collapse:collapse">${rows}</table>`,
    { eyebrow: "[ THE QUEUE ]", cta: { label: "Open Tickets", url: "https://tabor.quest/admin/tickets" } },
  );
  const res = await sendEmail(TEAM_EMAIL, `TABOR: ${reports.length} new report${reports.length === 1 ? "" : "s"}`, html);
  return NextResponse.json({ ok: true, count: reports.length, sent: res.ok ? 1 : 0 });
}

function escapeHtml(s: string) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] ?? c)); }
