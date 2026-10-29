// Site health for the BurgerBot hub's TABOR > SITE HEALTH tab: recent production deploys (Vercel),
// database response time, Zernio account connections, posts whose social publish failed, and which
// integrations are switched on (names only, never secrets). Agent key, read-only.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { zernioGet } from "@/lib/zernio";
import { agentAuthorized } from "@/lib/agent-auth";

export const dynamic = "force-dynamic";

const PROJECT = process.env.VERCEL_PROJECT_ID || "prj_IW3tEicRbU7B4npqf9t45CCHPdBf";

async function deploys() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) return { state: "unconfigured", recent: [] };
  try {
    const team = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : "";
    const j = await fetch(`https://api.vercel.com/v6/deployments?projectId=${PROJECT}&limit=8&target=production${team}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }).then((r) => r.json());
    const recent = (j.deployments ?? []).map((d: Record<string, unknown>) => ({
      state: d.state ?? d.readyState, createdAt: d.createdAt,
      message: String((d.meta as Record<string, unknown> | undefined)?.githubCommitMessage ?? "").split("\n")[0].slice(0, 120),
    }));
    return { state: recent[0]?.state ?? "unknown", recent };
  } catch { return { state: "unknown", recent: [] }; }
}

export async function GET(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sb = supabaseAdmin();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const t0 = Date.now();
  const [dep, ping, failed, integ, accounts] = await Promise.all([
    deploys(),
    sb.from("products").select("sku", { count: "exact", head: true }),
    sb.from("posts").select("id, title, social_status, updated_at").ilike("social_status", "Social:%").gte("updated_at", since).order("updated_at", { ascending: false }).limit(10),
    sb.from("integrations").select("provider, label, enabled, updated_at"),
    zernioGet("/accounts"),
  ]);
  const dbMs = Date.now() - t0;
  const list = (accounts.body as { accounts?: Record<string, unknown>[] } | null)?.accounts ?? [];
  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    deploy: dep,
    database: { ok: !ping.error, ms: dbMs, products: ping.count ?? null, error: ping.error?.message ?? null },
    zernio: {
      ok: accounts.status === 200,
      status: accounts.status,
      accounts: list.map((a) => ({ platform: a.platform, name: a.username ?? a.name ?? a.displayName ?? "", active: a.isActive ?? a.active ?? a.status ?? null })),
    },
    failedPosts: (failed.data ?? []).map((p) => ({ id: p.id, title: p.title, status: p.social_status, at: p.updated_at })),
    integrations: (integ.data ?? []).map((i) => ({ provider: i.provider, label: i.label, enabled: !!i.enabled, updated: i.updated_at })),
  });
}
