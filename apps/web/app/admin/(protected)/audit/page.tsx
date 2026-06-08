// Audit log viewer — recent admin actions.
import { supabaseServer } from "@/lib/supabase/server";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "8px 16px 14px" };
const th: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 8px", fontWeight: 400, textAlign: "left" };
const td: React.CSSProperties = { padding: "13px 8px", fontFamily: BODY, fontSize: 13, color: "#C3BDB1", verticalAlign: "middle" };

export default async function AuditPage() {
  const sb = await supabaseServer();
  const { data } = await sb.from("audit_log").select("actor, action, entity, entity_id, created_at").order("created_at", { ascending: false }).limit(200);
  const rows = data ?? [];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ GOVERNANCE ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Audit Log</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>Recent admin actions. Append-only; review periodically (good security hygiene).</p>
      </div>

      <div className="admin-card" style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Action", "Entity", "Actor", "When"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} style={{ ...td, color: "#8A847A" }}>No actions logged yet.</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.06em" }}>{r.action}</td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 11, color: "#C3BDB1" }}>{r.entity}{r.entity_id ? ` · ${String(r.entity_id).slice(0, 24)}` : ""}</td>
                  <td style={{ ...td, fontSize: 12, color: "#9A948A", wordBreak: "break-all" }}>{r.actor}</td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 10.5, color: "#8A847A", whiteSpace: "nowrap" }}>{new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
