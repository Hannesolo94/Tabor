// Returns / RMA manager. Review requests and move them through the workflow.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { updateReturn } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const STATUSES = ["requested", "approved", "rejected", "received", "refunded", "closed"];
const REASON: Record<string, string> = { defect: "Faulty / damaged", sizing: "Sizing", wrong_item: "Wrong item", other: "Other" };

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px" };
const btn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };

// requested/received/closed = pending (gold); approved/refunded = positive (green); rejected = danger (red)
function statusPill(status: string): React.CSSProperties {
  const green = ["approved", "refunded"].includes(status);
  const red = status === "rejected";
  const c = red ? "#C03A3A" : green ? "#5FB07A" : "#C9A961";
  const border = red ? "rgba(192,58,58,0.4)" : green ? "rgba(95,176,122,0.4)" : "rgba(201,169,97,0.4)";
  const bg = red ? "rgba(192,58,58,0.08)" : green ? "rgba(95,176,122,0.08)" : "rgba(201,169,97,0.08)";
  return { fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 8, color: c, border: `1px solid ${border}`, background: bg, display: "inline-block", textTransform: "uppercase" };
}

export default async function ReturnsPage() {
  const sb = await supabaseServer();
  const { data } = await sb.from("return_requests").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = data ?? [];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ AFTER-SALES ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Returns</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>Customer return + faulty-item requests. The refund itself happens in your payment gateway once connected; this tracks the workflow.</p>
      </div>

      {rows.length === 0 ? (
        <div style={cardStyle}><p style={{ fontFamily: BODY, fontSize: 13, color: "#8A847A", margin: 0 }}>No return requests yet.</p></div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {rows.map((r) => (
            <div key={r.id} className="admin-card" style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{REASON[r.reason] ?? r.reason}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", marginLeft: 10 }}>· {r.email}</span>
                </div>
                <span style={statusPill(r.status)}>{r.status}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#8A847A", letterSpacing: "0.06em", marginTop: 6 }}>
                REF {r.order_ref} {r.order_id ? <Link href={`/admin/orders/${r.order_id}`} style={{ color: GOLD, textDecoration: "none" }}>· VIEW ORDER →</Link> : "· (unlinked)"} · {new Date(r.created_at).toISOString().slice(0, 10)}
              </div>
              {r.detail && <p style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", margin: "10px 0 0", lineHeight: 1.5 }}>{r.detail}</p>}
              <form action={updateReturn} style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap", alignItems: "center" }}>
                <input type="hidden" name="id" value={r.id} />
                <select name="status" defaultValue={r.status} style={inp}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                <input name="admin_note" defaultValue={r.admin_note ?? ""} placeholder="Internal note" style={{ ...inp, flex: 1, minWidth: 160 }} />
                <button type="submit" style={btn}>Update</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
