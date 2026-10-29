// Daily FX refresh, triggered by the BurgerBot hub (no Vercel cron slot needed). refreshRates() keeps the
// last good rate when the two sources disagree, so a bad feed never reprices the catalogue.
// GET: current rates + age. POST: refresh now. Agent key.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { agentAuthorized } from "@/lib/agent-auth";
import { refreshRates } from "@/lib/fx";

export const dynamic = "force-dynamic";

async function current() {
  const { data } = await supabaseAdmin().from("fx_rates").select("currency, rate_per_usd, fetched_at").order("currency");
  const newest = (data ?? []).reduce((m, r) => (r.fetched_at && r.fetched_at > m ? r.fetched_at : m), "");
  return { rates: data ?? [], fetchedAt: newest || null, ageHours: newest ? Math.round((Date.now() - Date.parse(newest)) / 36e5) : null };
}

export async function GET(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await current());
}

export async function POST(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const report = await refreshRates();
  await supabaseAdmin().from("audit_log").insert({ actor: "agent", action: "fx.refresh", entity: "fx_rates", entity_id: null, detail: report });
  return NextResponse.json({ report, ...(await current()) });
}
