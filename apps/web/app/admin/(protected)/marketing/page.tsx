// Marketing dashboard: advertising (pixel status + on-site conversion data) and
// email (list overview + platform status). Ad-platform spend/ROAS pulls need the
// Meta/Google APIs (a later integration); on-site data is live now.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { getDashboard } from "@/lib/analytics-db";
import { getPixels } from "@/lib/pixels-db";
import { BarList } from "@/components/admin/Charts";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" }}>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", letterSpacing: "0.04em", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
function StatusRow({ name, on, detail }: { name: string; on: boolean; detail?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{name}</span>
      <span style={{ fontFamily: MONO, fontSize: 9.5, color: on ? "#7BBF7B" : "#8A847A", letterSpacing: "0.08em" }}>{on ? "● LIVE" : "○ NOT SET"}{detail ? ` · ${detail}` : ""}</span>
    </div>
  );
}

export default async function MarketingPage() {
  const sb = await supabaseServer();
  const [d, px, wl, omni] = await Promise.all([
    getDashboard("30d"),
    getPixels(),
    sb.from("waitlist").select("email, source", { count: "exact" }),
    sb.from("integrations").select("enabled, secret").eq("provider", "omnisend").maybeSingle(),
  ]);

  const rows = wl.data ?? [];
  const bySource = rows.reduce<Record<string, number>>((a, r) => { const k = r.source || "web"; a[k] = (a[k] || 0) + 1; return a; }, {});
  const omniConnected = !!(omni.data?.secret && omni.data?.enabled);

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ GROWTH ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Marketing</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 24px" }}>Last 30 days. On-site conversion is live; ad-platform spend/ROAS connect via the Meta/Google APIs (coming).</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginBottom: 14 }}>
        <Card title="Advertising pixels">
          <StatusRow name="Meta Pixel" on={!!px.meta} />
          <StatusRow name="Google Analytics (GA4)" on={!!px.ga4} />
          <StatusRow name="Google Ads" on={!!px.gads} />
          <StatusRow name="Google Tag Manager" on={!!px.gtm} />
          <p style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.06em", marginTop: 10 }}>SET IDS IN <Link href="/admin/settings" style={{ color: GOLD, textDecoration: "none" }}>SETTINGS</Link>. AD SPEND + ROAS PULL-IN: NEEDS API CONNECT (LATER).</p>
        </Card>
        <Card title="On-site performance">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["Sessions", String(d.sessions)], ["Conversion", `${d.conversion.toFixed(1)}%`], ["Cart abandon", `${d.cartAbandon.toFixed(0)}%`], ["App clicks", String(d.appClicks)]].map(([k, v]) => (
              <div key={k} style={{ border: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(160deg, rgba(40,40,50,0.5), rgba(16,16,22,0.42))", borderRadius: 12, boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset", padding: "10px 12px" }}>
                <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.12em" }}>{k}</div>
                <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 20, color: GOLD }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Card title="Traffic sources"><BarList items={d.sources.map((s) => ({ label: s.source, value: s.count }))} /></Card>
        <Card title="Email">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: BODY, fontSize: 14, color: "#C3BDB1" }}>{wl.count ?? 0} contacts collected</span>
            <Link href="/admin/customers" style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em", textDecoration: "none" }}>VIEW →</Link>
          </div>
          <BarList items={Object.entries(bySource).map(([k, v]) => ({ label: k, value: v }))} />
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <StatusRow name="Omnisend" on={omniConnected} detail={omniConnected ? "syncing" : "add key in settings"} />
            <p style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.06em", marginTop: 8 }}>CAMPAIGN OPEN/CLICK STATS LIVE IN OMNISEND. CONTACTS SYNC ON SIGNUP WHEN CONNECTED.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
