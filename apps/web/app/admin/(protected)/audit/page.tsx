// Audit log viewer — recent admin actions.
import { supabaseServer } from "@/lib/supabase/server";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const sb = await supabaseServer();
  const { data } = await sb.from("audit_log").select("actor, action, entity, entity_id, created_at").order("created_at", { ascending: false }).limit(200);
  const rows = data ?? [];

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ GOVERNANCE ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 8px" }}>Audit Log</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 22px" }}>Recent admin actions. Append-only; review periodically (good security hygiene).</p>

      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 120px", padding: "12px 18px", borderBottom: "1px solid rgba(201,169,97,0.12)", fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em" }}>
          <span>ACTION</span><span>ENTITY</span><span>ACTOR</span><span>WHEN</span>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: "22px 18px", fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No actions logged yet.</div>
        ) : (
          rows.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 120px", alignItems: "center", padding: "10px 18px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.06em" }}>{r.action}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#C3BDB1" }}>{r.entity}{r.entity_id ? ` · ${String(r.entity_id).slice(0, 24)}` : ""}</span>
              <span style={{ fontFamily: BODY, fontSize: 12, color: "#9A948A", wordBreak: "break-all" }}>{r.actor}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#8A847A" }}>{new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
