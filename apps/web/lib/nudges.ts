// Conversion nudges. Abandoned checkout: an order that stayed "pending_payment" past the delay gets
// one email with a single-use code, valid for a limited time. OFF until Hannes switches it on in the
// BurgerBot hub (app_settings key "nudges"). Runs when the hub asks (every 15 min), so no Vercel cron.
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, emailShell } from "@/lib/email";

export interface NudgeConfig { enabled: boolean; percent: number; delayHours: number; validHours: number; maxAgeHours: number }
export const NUDGE_DEFAULTS: NudgeConfig = { enabled: false, percent: 10, delayHours: 1, validHours: 48, maxAgeHours: 48 };
const TAG = "nudge:abandoned";
const SITE = "https://tabor.quest";

export async function getNudgeConfig(): Promise<NudgeConfig> {
  const { data } = await supabaseAdmin().from("app_settings").select("value").eq("key", "nudges").maybeSingle();
  return { ...NUDGE_DEFAULTS, ...((data?.value as Partial<NudgeConfig> | null) ?? {}) };
}

export async function setNudgeConfig(patch: Partial<NudgeConfig>): Promise<NudgeConfig> {
  const cur = await getNudgeConfig();
  const next: NudgeConfig = {
    enabled: patch.enabled ?? cur.enabled,
    percent: Math.min(30, Math.max(5, Math.round(patch.percent ?? cur.percent))),
    delayHours: Math.min(24, Math.max(1, Number(patch.delayHours ?? cur.delayHours))),
    validHours: Math.min(168, Math.max(12, Number(patch.validHours ?? cur.validHours))),
    maxAgeHours: cur.maxAgeHours,
  };
  await supabaseAdmin().from("app_settings").upsert({ key: "nudges", value: next, updated_at: new Date().toISOString() });
  return next;
}

interface Item { name?: string; sku?: string; qty?: number; size?: string }

/** The reminder email. Plain, brotherly, no pressure, one code, one button. */
export function abandonedEmail(items: Item[], code: string, percent: number, validHours: number): { subject: string; html: string } {
  const list = items.map((i) => `${i.name ?? i.sku}${i.size ? ` (${i.size})` : ""}${(i.qty ?? 1) > 1 ? ` x${i.qty}` : ""}`).join(", ");
  const first = items[0]?.sku ? `${SITE}/product/${items[0].sku}` : `${SITE}/shop`;
  const body = `<p>You left something at the checkout: <b>${list || "your bag"}</b>.</p>
    <p>No pressure. If you still want it, here is <b>${percent}% off</b> to bring it home. Use the code below at checkout.</p>
    <p style="font-family:'Courier New',monospace;font-size:22px;letter-spacing:4px;color:#E8D08C;text-align:center;padding:14px;border:1px solid rgba(201,169,97,0.5);border-radius:10px">${code}</p>
    <p>The code works once and expires in ${validHours} hours.</p>`;
  return {
    subject: `You left something behind. Here is ${percent}% off.`,
    html: emailShell("Still yours if you want it", body, {
      eyebrow: "[ CHECKOUT ]", preheader: `${percent}% off to finish your order. One use, ${validHours} hours.`,
      cta: { label: "Finish my order", url: first },
      footnote: "You are getting this because you started a checkout at tabor.quest. It is a one-time reminder, we will not email about this order again.",
    }),
  };
}

function newCode(): string { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = ""; for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return `COMEBACK-${s}`; }

/** Orders that qualify right now (pending past the delay, inside max age, not nudged, no later paid order by that email). */
export async function nudgeCandidates(cfg: NudgeConfig) {
  const sb = supabaseAdmin(), now = Date.now();
  const { data } = await sb.from("orders").select("id, email, items, tags, created_at, status")
    .eq("status", "pending_payment").lt("created_at", new Date(now - cfg.delayHours * 3600e3).toISOString())
    .gt("created_at", new Date(now - cfg.maxAgeHours * 3600e3).toISOString()).limit(50);
  const out = [];
  for (const o of data ?? []) {
    if (!o.email || (Array.isArray(o.tags) && o.tags.includes(TAG))) continue;
    const { count } = await sb.from("orders").select("id", { count: "exact", head: true }).eq("email", o.email).in("status", ["paid", "processing", "fulfilled", "shipped"]).gte("created_at", o.created_at);
    if (count) continue;   // they came back and bought
    out.push(o);
  }
  return out;
}

/** Send the nudges that are due. Does nothing while switched off. */
export async function runAbandonedCheckout(): Promise<{ enabled: boolean; sent: { order: string; code: string }[]; errors: string[] }> {
  const cfg = await getNudgeConfig();
  if (!cfg.enabled) return { enabled: false, sent: [], errors: [] };
  const sb = supabaseAdmin(), sent: { order: string; code: string }[] = [], errors: string[] = [];
  for (const o of await nudgeCandidates(cfg)) {
    const code = newCode();
    const { error: ce } = await sb.from("discount_codes").insert({ code, percent: cfg.percent, value_type: "percentage", active: true, usage_limit: 1, once_per_email: true,
      ends_at: new Date(Date.now() + cfg.validHours * 3600e3).toISOString(), note: `Abandoned checkout nudge for order ${o.id}`, tags: ["nudge"] });
    if (ce) { errors.push(`code for ${o.id}: ${ce.message}`); continue; }
    const mail = abandonedEmail((o.items ?? []) as Item[], code, cfg.percent, cfg.validHours);
    const r = await sendEmail(String(o.email), mail.subject, mail.html);
    if (!r.ok) { errors.push(`email for ${o.id}: ${r.error}`); await sb.from("discount_codes").update({ active: false }).eq("code", code); continue; }
    await sb.from("orders").update({ tags: [...((o.tags as string[]) ?? []), TAG] }).eq("id", o.id);
    await sb.from("audit_log").insert({ actor: "agent", action: "nudge.abandoned_checkout", entity: "order", entity_id: o.id, detail: { code, percent: cfg.percent } });
    sent.push({ order: o.id, code });
  }
  return { enabled: true, sent, errors };
}
