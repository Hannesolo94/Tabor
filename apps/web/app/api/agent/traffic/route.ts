// Traffic for the BurgerBot hub's TABOR > TRAFFIC tab: site traffic from analytics_events
// (with organic social split out by referrer + utm tags) and organic post stats from Zernio.
// Same agent key as /api/agent/posts. Read-only.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getDashboard, type RangeKey } from "@/lib/analytics-db";
import { zernioGet } from "@/lib/zernio";
import { agentAuthorized } from "@/lib/agent-auth";

export const dynamic = "force-dynamic";

const RANGES: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

function channel(referrer: string | null, meta: Record<string, unknown> | null): string {
  const src = String(meta?.utm_source ?? "").toLowerCase();
  const r = String(referrer ?? "").toLowerCase();
  if (/instagram|^ig$/.test(src) || /instagram\.com|l\.instagram/.test(r)) return "instagram";
  if (/tiktok/.test(src) || /tiktok\.com/.test(r)) return "tiktok";
  if (/facebook|^fb$/.test(src) || /facebook\.com|fb\.com|l\.facebook/.test(r)) return "facebook";
  if (/youtube/.test(src) || /youtube\.com|youtu\.be/.test(r)) return "youtube";
  if (src) return src;
  if (/google\./.test(r)) return "google";
  if (!r || /tabor\.quest/.test(r)) return "direct";
  return r.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
}

export async function GET(req: Request) {
  if (!(await agentAuthorized(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const range = new URL(req.url).searchParams.get("range") ?? "7d";
  const days = RANGES[range] ?? 7;
  const to = new Date(), from = new Date(to.getTime() - days * 86400000);
  const ymd = (d: Date) => d.toISOString().slice(0, 10);

  const [dash, ev, social] = await Promise.all([
    getDashboard(range as RangeKey).catch(() => null),
    supabaseAdmin().from("analytics_events").select("referrer, meta, session_id, path, type").eq("type", "pageview").gte("created_at", from.toISOString()).limit(50000),
    zernioGet(`/analytics/dashboard?platform=all&fromDate=${ymd(from)}&toDate=${ymd(to)}&compare=previous_period&topPosts=6&recentPosts=10`),
  ]);

  // pageviews and sessions per channel, and which pages organic social lands on
  const byChannel: Record<string, { pageviews: number; sessions: Set<string> }> = {};
  const landings: Record<string, number> = {};
  for (const e of ev.data ?? []) {
    const ch = channel(e.referrer as string | null, e.meta as Record<string, unknown> | null);
    const c = (byChannel[ch] ??= { pageviews: 0, sessions: new Set() });
    c.pageviews++; if (e.session_id) c.sessions.add(String(e.session_id));
    if (ch === "instagram" || ch === "tiktok") landings[String(e.path)] = (landings[String(e.path)] ?? 0) + 1;
  }
  const channels = Object.entries(byChannel).map(([name, v]) => ({ name, pageviews: v.pageviews, sessions: v.sessions.size })).sort((a, b) => b.pageviews - a.pageviews);

  // name Zernio's posts with our Content Studio titles + covers (posts.social_post_id = Zernio post id)
  if (social.status === 200 && social.body) {
    const sd = social.body as { topPosts?: Record<string, unknown>[]; recentPosts?: Record<string, unknown>[] };
    const ids = [...new Set([...(sd.topPosts ?? []), ...(sd.recentPosts ?? [])].map((p) => String(p.postId)))];
    if (ids.length) {
      const { data: ours } = await supabaseAdmin().from("posts").select("id, title, cover_image, social_post_id").in("social_post_id", ids);
      const by = new Map((ours ?? []).map((o) => [String(o.social_post_id), o]));
      for (const list of [sd.topPosts ?? [], sd.recentPosts ?? []]) for (const p of list) {
        const o = by.get(String(p.postId)); if (o) { p.title = o.title; p.cover = o.cover_image; p.studioId = o.id; }
      }
    }
  }

  return NextResponse.json({
    range, from: ymd(from), to: ymd(to),
    site: dash ? {
      pageviews: dash.pageviews, sessions: dash.sessions, visitors: dash.visitors, conversion: dash.conversion,
      orders: dash.orderCount, revenue: dash.revenue, appClicks: dash.appClicks, deltas: dash.deltas,
      series: { labels: dash.series.labels, sessions: dash.series.sessions, orders: dash.series.orders },
      topProducts: dash.topProducts.slice(0, 5), funnel: dash.funnel,
    } : null,
    channels,
    socialLandings: Object.entries(landings).map(([path, n]) => ({ path, n })).sort((a, b) => b.n - a.n).slice(0, 8),
    social: { status: social.status, data: social.status === 200 ? social.body : null, error: social.status === 200 ? null : social.body },
  });
}
