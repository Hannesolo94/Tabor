// Settings hub: store config, integration keys (DB-backed, editable), and a
// read-only status of core infrastructure keys (managed in the deployment env).
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin-guard";
import { saveStore, saveIntegration, addIntegration, savePixels } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const cardTitle: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px", width: "100%" };
const saveBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };

export default async function SettingsPage() {
  await requireAdmin();
  const sb = await supabaseServer();
  const [storeRes, intRes, pxRes] = await Promise.all([
    sb.from("app_settings").select("value").eq("key", "store").maybeSingle(),
    sb.from("integrations").select("provider, label, secret, enabled, updated_at").order("label", { ascending: true }),
    sb.from("app_settings").select("value").eq("key", "pixels").maybeSingle(),
  ]);
  const s = (storeRes.data?.value ?? {}) as Record<string, string | number>;
  const integrations = intRes.data ?? [];
  const px = (pxRes.data?.value ?? {}) as Record<string, string>;

  // core infra (env) — show only configured/not, never values
  const infra = [
    ["Supabase", !!process.env.NEXT_PUBLIC_SUPABASE_URL],
    ["Supabase service role", !!process.env.SUPABASE_SERVICE_ROLE_KEY],
    ["Printful", !!process.env.PRINTFUL_API_KEY],
  ] as const;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ CONTROL ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Settings</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>Store details, third-party integrations, marketing pixels, and infrastructure status.</p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {/* store settings */}
        <form action={saveStore} className="admin-card" style={cardStyle}>
          <div style={cardTitle}>Store details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Store name</label><input name="name" defaultValue={String(s.name ?? "TABOR")} style={inp} /></div>
            <div><label style={lbl}>Support email</label><input name="support_email" defaultValue={String(s.support_email ?? "")} style={inp} /></div>
            <div><label style={lbl}>Instagram URL</label><input name="instagram" defaultValue={String(s.instagram ?? "")} style={inp} /></div>
            <div><label style={lbl}>TikTok URL</label><input name="tiktok" defaultValue={String(s.tiktok ?? "")} style={inp} /></div>
            <div><label style={lbl}>X / Twitter URL</label><input name="x" defaultValue={String(s.x ?? "")} style={inp} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div><label style={lbl}>Promo code</label><input name="promo_code" defaultValue={String(s.promo_code ?? "FIRE10")} style={inp} /></div>
              <div><label style={lbl}>Percent</label><input name="promo_percent" type="number" defaultValue={Number(s.promo_percent ?? 10)} style={inp} /></div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}><button type="submit" style={saveBtn}>Save store</button></div>
        </form>

        {/* integrations */}
        <div className="admin-card" style={cardStyle}>
          <div style={{ ...cardTitle, marginBottom: 4 }}>Integrations</div>
          <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 16px" }}>Third-party API keys (e.g. your email platform). Stored securely and admin-only. Leave a key blank to keep the current one.</p>

          {integrations.map((it) => (
            <form key={it.provider} action={saveIntegration} style={{ display: "grid", gridTemplateColumns: "1.4fr 2fr auto auto", gap: 10, alignItems: "end", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <input type="hidden" name="provider" value={it.provider} />
              <div>
                <label style={lbl}>{it.label ?? it.provider}</label>
                <div style={{ fontFamily: MONO, fontSize: 9, color: it.enabled ? "#7BBF7B" : "#8A847A", letterSpacing: "0.08em" }}>{it.secret ? (it.enabled ? "● ACTIVE" : "○ KEY SET, DISABLED") : "○ NO KEY"}</div>
              </div>
              <input name="secret" type="password" placeholder={it.secret ? "******** (saved)" : "paste API key"} style={inp} />
              <label style={{ fontFamily: MONO, fontSize: 10, color: "#C3BDB1", display: "flex", gap: 6, alignItems: "center", paddingBottom: 10 }}>
                <input type="checkbox" name="enabled" defaultChecked={it.enabled} /> On
              </label>
              <button type="submit" style={{ ...saveBtn, padding: "10px 14px" }}>Save</button>
            </form>
          ))}

          {/* add new */}
          <form action={addIntegration} style={{ display: "grid", gridTemplateColumns: "1.4fr 2fr auto", gap: 10, alignItems: "end", marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(201,169,97,0.14)" }}>
            <div><label style={lbl}>Add integration (name)</label><input name="label" placeholder="e.g. PostHog" style={inp} /></div>
            <div><label style={lbl}>API key (optional)</label><input name="secret" type="password" placeholder="paste key" style={inp} /></div>
            <button type="submit" style={{ ...saveBtn, padding: "10px 14px" }}>Add</button>
          </form>
        </div>

        {/* marketing pixels */}
        <form action={savePixels} className="admin-card" style={cardStyle}>
          <div style={{ ...cardTitle, marginBottom: 4 }}>Marketing pixels</div>
          <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 16px" }}>Paste your tracking IDs. They are injected on the storefront so Meta and Google can measure conversions for ads. Leave blank to disable.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Meta Pixel ID</label><input name="meta" defaultValue={px.meta ?? ""} placeholder="e.g. 123456789012345" style={inp} /></div>
            <div><label style={lbl}>Google Analytics (GA4) ID</label><input name="ga4" defaultValue={px.ga4 ?? ""} placeholder="G-XXXXXXX" style={inp} /></div>
            <div><label style={lbl}>Google Ads ID</label><input name="gads" defaultValue={px.gads ?? ""} placeholder="AW-XXXXXXXXX" style={inp} /></div>
            <div><label style={lbl}>Google Tag Manager ID</label><input name="gtm" defaultValue={px.gtm ?? ""} placeholder="GTM-XXXXXXX" style={inp} /></div>
          </div>
          <div style={{ marginTop: 16 }}><button type="submit" style={saveBtn}>Save pixels</button></div>
        </form>

        {/* infra status (read-only) */}
        <div className="admin-card" style={cardStyle}>
          <div style={{ ...cardTitle, marginBottom: 4 }}>Core infrastructure</div>
          <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 14px" }}>Managed securely in the deployment environment (not web-editable, by design). Status only.</p>
          {infra.map(([name, ok]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{name}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: ok ? "#7BBF7B" : "#C03A3A", letterSpacing: "0.08em" }}>{ok ? "● CONFIGURED" : "○ MISSING"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
