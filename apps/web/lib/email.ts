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
export interface EmailOpts {
  preheader?: string;          // hidden inbox-preview line
  eyebrow?: string;            // small mono tag above the title, e.g. "[ THE SYSTEM ]"
  cta?: { label: string; url: string };
  footnote?: string;          // small line under the body (e.g. unsubscribe note)
}

/** TABOR-branded responsive HTML email. Table-based + inline styles for broad
 *  client support (Gmail, Apple Mail, Outlook). Typographic header (no images). */
export function emailShell(title: string, body: string, opts: EmailOpts = {}): string {
  const { preheader, eyebrow, cta, footnote } = opts;
  const serif = "Georgia, 'Times New Roman', serif";
  const mono = "'Courier New', ui-monospace, monospace";
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 6px"><tr><td align="center" bgcolor="#C9A961" style="border-radius:2px;background-image:linear-gradient(180deg,#E8D08C,#C9A961)">
        <a href="${cta.url}" target="_blank" style="display:inline-block;padding:14px 34px;font-family:${serif};font-weight:bold;font-size:13px;letter-spacing:1.5px;color:#0A0A0A;text-decoration:none;text-transform:uppercase">${cta.label}</a>
      </td></tr></table>`
    : "";
  const foot = footnote ? `<p style="margin:18px 0 0;font-family:${serif};font-size:12px;line-height:1.6;color:#8A847A">${footnote}</p>` : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark light"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0A0A0A;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all">${preheader ?? `${title} — TABOR. Sons of Fire.`}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0A0A0A" style="background:#0A0A0A;padding:28px 14px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0E0E12;border:1px solid rgba(201,169,97,0.28)">
        <!-- gold top bar -->
        <tr><td style="height:4px;line-height:4px;font-size:0;background:#C9A961;background-image:linear-gradient(90deg,#A8843E,#E8D08C,#A8843E)">&nbsp;</td></tr>
        <!-- header / wordmark -->
        <tr><td align="center" style="padding:34px 30px 8px">
          <div style="font-family:${mono};font-size:10px;letter-spacing:5px;color:#C9A961">&#10013;</div>
          <div style="font-family:${serif};font-size:34px;letter-spacing:10px;color:#E8E2D5;font-weight:bold;padding:6px 0 2px;text-transform:uppercase">Tabor</div>
          <div style="font-family:${mono};font-size:10px;letter-spacing:5px;color:#8A847A">SONS OF FIRE</div>
        </td></tr>
        <!-- divider -->
        <tr><td align="center" style="padding:18px 30px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="border-bottom:1px solid rgba(201,169,97,0.22)">&nbsp;</td>
          <td width="30" align="center" style="font-family:${serif};color:#C9A961;font-size:14px;padding:0 6px">&#10022;</td>
          <td style="border-bottom:1px solid rgba(201,169,97,0.22)">&nbsp;</td>
        </tr></table></td></tr>
        <!-- body -->
        <tr><td style="padding:24px 34px 34px">
          ${eyebrow ? `<div style="font-family:${mono};font-size:10px;letter-spacing:3px;color:#C9A961;margin-bottom:10px">${eyebrow}</div>` : ""}
          <h1 style="margin:0 0 14px;font-family:${serif};font-size:26px;line-height:1.25;color:#E8E2D5;font-weight:bold">${title}</h1>
          <div style="font-family:${serif};font-size:15.5px;line-height:1.7;color:#C3BDB1">${body}</div>
          ${button}
          ${foot}
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:0 34px"><div style="border-top:1px solid rgba(201,169,97,0.16)"></div></td></tr>
        <tr><td align="center" style="padding:18px 34px 30px">
          <div style="font-family:${mono};font-size:10px;letter-spacing:2px;color:#C9A961">FORGED NOT BOUGHT</div>
          <div style="font-family:${mono};font-size:10px;letter-spacing:1px;color:#6e6a60;padding-top:6px">
            <a href="https://tabor.quest" target="_blank" style="color:#8A847A;text-decoration:none">tabor.quest</a>
            &nbsp;&middot;&nbsp; Free for life
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
