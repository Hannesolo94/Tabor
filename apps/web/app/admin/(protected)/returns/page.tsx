// Returns / RMA manager. Review requests and move them through the workflow.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { updateReturn } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const STATUSES = ["requested", "approved", "rejected", "received", "refunded", "closed"];
const COLOR: Record<string, string> = { requested: "#E8D08C", approved: "#7BBF7B", rejected: "#C03A3A", received: "#9A948A", refunded: "#7BBF7B", closed: "#8A847A" };
const REASON: Record<string, string> = { defect: "Faulty / damaged", sizing: "Sizing", wrong_item: "Wrong item", other: "Other" };

export default async function ReturnsPage() {
  const sb = await supabaseServer();
  const { data } = await sb.from("return_requests").select("*").order("created_at", { ascending: false }).limit(200);
  const rows = data ?? [];

  const inp: React.CSSProperties = { fontFamily: MONO, fontSize: 10, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "7px 9px" };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ AFTER-SALES ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 8px" }}>Returns</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 22px" }}>Customer return + faulty-item requests. The refund itself happens in your payment gateway once connected; this tracks the workflow.</p>

      {rows.length === 0 ? (
        <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A" }}>No return requests yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12", padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5" }}>{REASON[r.reason] ?? r.reason}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", marginLeft: 10 }}>· {r.email}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: COLOR[r.status] ?? "#9A948A", textTransform: "uppercase" }}>● {r.status}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#8A847A", letterSpacing: "0.06em", marginTop: 4 }}>
                REF {r.order_ref} {r.order_id ? <Link href={`/admin/orders/${r.order_id}`} style={{ color: GOLD, textDecoration: "none" }}>· VIEW ORDER →</Link> : "· (unlinked)"} · {new Date(r.created_at).toISOString().slice(0, 10)}
              </div>
              {r.detail && <p style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1", margin: "10px 0 0", lineHeight: 1.5 }}>{r.detail}</p>}
              <form action={updateReturn} style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                <input type="hidden" name="id" value={r.id} />
                <select name="status" defaultValue={r.status} style={inp}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                <input name="admin_note" defaultValue={r.admin_note ?? ""} placeholder="Internal note" style={{ ...inp, flex: 1, minWidth: 160, fontFamily: BODY, fontSize: 12 }} />
                <button type="submit" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "8px 14px", cursor: "pointer" }}>Update</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
