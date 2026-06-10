// Ad Studio: paid-ads infrastructure, built ahead of running ads. Campaigns hold
// creatives (media + ad copy) that sit 'ready' until the day we go live on Meta/TikTok.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { createCampaign } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px", width: "100%" };
const goldBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };

const STATUS_COLOR: Record<string, string> = { draft: "#8A847A", ready: "#C9A961", active: "#7BBF7B", paused: "#5B9BD5", archived: "#6A645A" };

interface Camp { id: string; name: string; objective: string; platforms: { meta?: boolean; tiktok?: boolean } | null; status: string; budget_cents: number | null; currency: string; start_at: string | null; updated_at: string }

export default async function AdStudio() {
  const sb = await supabaseServer();
  const [{ data: camps }, { data: counts }] = await Promise.all([
    sb.from("ad_campaigns").select("id, name, objective, platforms, status, budget_cents, currency, start_at, updated_at").order("updated_at", { ascending: false }),
    sb.from("ad_creatives").select("campaign_id"),
  ]);
  const campaigns = (camps ?? []) as Camp[];
  const creativesBy = new Map<string, number>();
  for (const c of counts ?? []) creativesBy.set(c.campaign_id, (creativesBy.get(c.campaign_id) ?? 0) + 1);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ AD STUDIO ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Ad Studio</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0", maxWidth: 640 }}>Build campaigns and creatives ahead of time: media, hooks, copy, budgets. Everything sits ready for the day we switch ads on (Meta and TikTok connect here later).</p>
      </div>

      <div style={{ display: "grid", gap: 22 }}>
        {/* New campaign */}
        <form action={createCampaign} className="admin-card" style={{ ...cardStyle, maxWidth: 560 }}>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 }}>New campaign</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input name="name" placeholder="e.g. Risen Knight launch" required style={{ ...inp, flex: 1 }} />
            <button type="submit" style={goldBtn}>Create</button>
          </div>
        </form>

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <div className="admin-card" style={{ ...cardStyle, padding: "8px 20px 10px" }}>
            {campaigns.map((c, i) => {
              const plats = [c.platforms?.meta ? "META" : null, c.platforms?.tiktok ? "TIKTOK" : null].filter(Boolean).join(" + ") || "NO PLATFORM";
              const n = creativesBy.get(c.id) ?? 0;
              return (
                <Link key={c.id} href={`/admin/ads/${c.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "13px 0", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none", textDecoration: "none" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 8, color: "#8A847A", letterSpacing: "0.08em", flexShrink: 0 }}>{plats}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>{n} creative{n === 1 ? "" : "s"}</span>
                    {c.budget_cents != null && <span style={{ fontFamily: MONO, fontSize: 9, color: "#9A948A" }}>{c.currency} {(c.budget_cents / 100).toFixed(0)}</span>}
                    <span style={{ fontFamily: MONO, fontSize: 9, color: STATUS_COLOR[c.status] ?? "#8A847A", letterSpacing: "0.1em", textTransform: "uppercase" }}>● {c.status}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        {campaigns.length === 0 && (
          <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No campaigns yet. Create the first one above: it becomes the folder your ad creatives live in.</p>
        )}
      </div>
    </div>
  );
}
