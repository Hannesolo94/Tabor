// Conversion nudges for the BurgerBot hub. GET: settings, who qualifies now, the codes and nudges
// sent lately, and a preview of the email. POST: { action: "config", enabled?, percent?, delayHours?,
// validHours? } (the hub only sends this from Hannes's devices) or { action: "run" }. Agent key.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { agentAuthorized } from "@/lib/agent-auth";
import { getNudgeConfig, setNudgeConfig, nudgeCandidates, runAbandonedCheckout, abandonedEmail } from "@/lib/nudges";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const cfg = await getNudgeConfig();
  const sb = supabaseAdmin();
  const [cands, codes] = await Promise.all([
    nudgeCandidates(cfg),
    sb.from("discount_codes").select("code, percent, used_count, active, ends_at, created_at, note").contains("tags", ["nudge"]).order("created_at", { ascending: false }).limit(20),
  ]);
  const used = (codes.data ?? []).filter((c) => Number(c.used_count) > 0).length;
  return NextResponse.json({
    config: cfg,
    waiting: cands.length,
    recent: codes.data ?? [],
    converted: used,
    preview: abandonedEmail([{ name: "The Risen Knight", sku: "the-risen-knight", size: "L" }], "COMEBACK-SAMPLE", cfg.percent, cfg.validHours),
  });
}

export async function POST(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (b.action === "config") {
    const cfg = await setNudgeConfig({ enabled: typeof b.enabled === "boolean" ? b.enabled : undefined, percent: b.percent as number | undefined, delayHours: b.delayHours as number | undefined, validHours: b.validHours as number | undefined });
    await supabaseAdmin().from("audit_log").insert({ actor: "agent", action: "nudge.config", entity: "app_settings", entity_id: "nudges", detail: cfg });
    return NextResponse.json({ ok: true, config: cfg });
  }
  if (b.action === "run") return NextResponse.json(await runAbandonedCheckout());
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
