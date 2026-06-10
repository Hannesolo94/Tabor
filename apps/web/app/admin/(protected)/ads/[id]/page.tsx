import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { updateCampaign, deleteCampaign, type AdMediaCard } from "../actions";
import { AdCreatives, type CreativeData } from "../AdCreatives";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px", width: "100%" };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const goldBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };

const toLocal = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const [{ data: c }, { data: creatives }] = await Promise.all([
    sb.from("ad_campaigns").select("*").eq("id", id).maybeSingle(),
    sb.from("ad_creatives").select("*").eq("campaign_id", id).order("created_at", { ascending: true }),
  ]);
  if (!c) notFound();
  const ids = (creatives ?? []).map((x) => x.id);
  const { data: mediaRows } = ids.length
    ? await sb.from("ad_media").select("creative_id, kind, url, poster_url, sort").in("creative_id", ids).order("sort", { ascending: true })
    : { data: [] };
  const mediaBy = new Map<string, AdMediaCard[]>();
  for (const m of mediaRows ?? []) {
    const a = mediaBy.get(m.creative_id) ?? [];
    a.push({ kind: m.kind, url: m.url, poster_url: m.poster_url });
    mediaBy.set(m.creative_id, a);
  }
  const list: CreativeData[] = (creatives ?? []).map((x) => ({
    id: x.id, title: x.title, format: x.format, hook: x.hook, primary_text: x.primary_text,
    headline: x.headline, cta: x.cta, link_url: x.link_url, brief: x.brief, status: x.status,
    media: mediaBy.get(x.id) ?? [],
  }));
  const platforms = (c.platforms ?? {}) as { meta?: boolean; tiktok?: boolean };

  return (
    <div>
      <Link href="/admin/ads" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>← AD STUDIO</Link>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: "14px 0 20px" }}>{c.name}</h1>

      <div style={{ display: "grid", gap: 22, maxWidth: 860 }}>
        {/* campaign settings */}
        <form action={updateCampaign} className="admin-card" style={cardStyle}>
          <input type="hidden" name="id" value={c.id} />
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginBottom: 14 }}>Campaign</div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Name</label><input name="name" defaultValue={c.name} style={inp} /></div>
            <div><label style={lbl}>Objective</label>
              <select name="objective" defaultValue={c.objective} style={inp}>
                {["awareness", "traffic", "engagement", "leads", "conversions"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Status</label>
              <select name="status" defaultValue={c.status} style={inp}>
                {["draft", "ready", "active", "paused", "archived"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
            <div><label style={lbl}>Budget</label><input name="budget" type="number" step="0.01" defaultValue={c.budget_cents != null ? (c.budget_cents / 100).toString() : ""} placeholder="e.g. 500" style={inp} /></div>
            <div><label style={lbl}>Currency</label>
              <select name="currency" defaultValue={c.currency} style={inp}>{["USD", "ZAR", "EUR"].map((o) => <option key={o} value={o}>{o}</option>)}</select>
            </div>
            <div><label style={lbl}>Starts</label><input name="start_at" type="datetime-local" defaultValue={toLocal(c.start_at)} style={{ ...inp, colorScheme: "dark" }} /></div>
            <div><label style={lbl}>Ends</label><input name="end_at" type="datetime-local" defaultValue={toLocal(c.end_at)} style={{ ...inp, colorScheme: "dark" }} /></div>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 12 }}>
            <span style={lbl}>Platforms</span>
            <label style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", display: "flex", gap: 7, alignItems: "center" }}><input type="checkbox" name="meta" defaultChecked={!!platforms.meta} /> Meta (IG + FB)</label>
            <label style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", display: "flex", gap: 7, alignItems: "center" }}><input type="checkbox" name="tiktok" defaultChecked={!!platforms.tiktok} /> TikTok</label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div><label style={lbl}>Audience / targeting notes</label><textarea name="audience" rows={3} defaultValue={c.audience ?? ""} placeholder="e.g. Men 18-40, US + ZA, interests: faith, lifting, gaming" style={{ ...inp, resize: "vertical" }} /></div>
            <div><label style={lbl}>Notes</label><textarea name="notes" rows={3} defaultValue={c.notes ?? ""} placeholder="Budget period, angles to test, learnings…" style={{ ...inp, resize: "vertical" }} /></div>
          </div>
          <div style={{ marginTop: 14 }}><button type="submit" style={goldBtn}>Save campaign</button></div>
        </form>

        {/* creatives */}
        <AdCreatives campaignId={c.id} initial={list} />

        <form action={deleteCampaign} style={{ paddingTop: 16, borderTop: "1px solid rgba(192,58,58,0.25)" }}>
          <input type="hidden" name="id" value={c.id} />
          <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C03A3A", background: "rgba(192,58,58,0.06)", border: "1px solid rgba(192,58,58,0.4)", borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>Delete campaign</button>
        </form>
      </div>
    </div>
  );
}
