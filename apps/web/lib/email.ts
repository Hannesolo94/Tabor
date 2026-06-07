// Server-side transactional email via Resend. Key read from the integrations
// table (Settings > Integrations > resend) or RESEND_API_KEY env. Until a key is
// set, send() returns a clear "not configured" result instead of throwing.
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getConfig(): Promise<{ key: string; from: string } | null> {
  const admin = supabaseAdmin();
  const { data } = await admin.from("integrations").select("secret, enabled, meta").eq("provider", "resend").maybeSingle();
  const key = (data?.enabled && data?.secret) || process.env.RESEND_API_KEY;
  if (!key) return null;
  // Verified-domain sender, or Resend's test sender (works to your own account email)
  const from = ((data?.meta as { from?: string } | null)?.from) || process.env.EMAIL_FROM || "TABOR <onboarding@resend.dev>";
  return { key: String(key), from };
}

export interface SendResult { ok: boolean; error?: string }

export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const cfg = await getConfig();
  if (!cfg) return { ok: false, error: "No email provider configured. Add a Resend API key in Settings > Integrations." };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: cfg.from, to, subject, html }),
    });
    if (!res.ok) return { ok: false, error: `Resend error ${res.status}: ${(await res.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}

/** TABOR-branded email shell. */
export function emailShell(title: string, body: string): string {
  return `<div style="background:#0A0A0A;padding:32px;font-family:Georgia,serif;color:#E8E2D5">
    <div style="max-width:520px;margin:0 auto;border:1px solid #2a2a22;padding:28px">
      <div style="color:#C9A961;letter-spacing:4px;font-size:12px;font-family:monospace">TABOR · SONS OF FIRE</div>
      <h1 style="color:#E8E2D5;font-size:24px;margin:14px 0">${title}</h1>
      <div style="color:#C3BDB1;font-size:15px;line-height:1.6">${body}</div>
      <div style="color:#6e6a60;font-size:11px;font-family:monospace;margin-top:28px;border-top:1px solid #2a2a22;padding-top:14px">FORGED NOT BOUGHT · tabor.quest</div>
    </div>
  </div>`;
}
