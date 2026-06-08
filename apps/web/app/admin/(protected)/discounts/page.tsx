// Discount codes — list. Click a code to open the full editor (value, eligibility,
// minimums, max uses, active dates, tags). Codes apply at checkout once payments are live.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { createDiscount } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "8px 16px 14px" };
const btn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };
const th: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 8px", fontWeight: 400 };
const td: React.CSSProperties = { padding: "13px 8px", fontFamily: BODY, fontSize: 13, color: "#C3BDB1", verticalAlign: "top" };
const sub: React.CSSProperties = { fontFamily: MONO, fontSize: 10, color: "#8A847A", marginTop: 3 };
const badge = (on: boolean): React.CSSProperties => ({ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 8, color: on ? "#5FB07A" : "#9A948A", border: `1px solid ${on ? "rgba(95,176,122,0.4)" : "rgba(255,255,255,0.12)"}` });

interface Row { id: string; code: string; value_type: string; percent: number | null; amount: number | null; active: boolean; usage_limit: number | null; used_count: number; min_subtotal: number | null; ends_at: string | null; note: string | null }

export default async function AdminDiscounts() {
  const sb = await supabaseServer();
  const { data } = await sb.from("discount_codes").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];
  const value = (d: Row) => (d.value_type === "fixed" ? `$${Number(d.amount || 0).toFixed(2)}` : `${d.percent ?? 0}%`);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ PROMOS ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Discounts</h1>
        </div>
        <form action={createDiscount}><button type="submit" style={btn}>Create discount</button></form>
      </div>

      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Code", "Status", "Value", "Min spend", "Used", "Ends"].map((h, i) => <th key={h} style={{ ...th, textAlign: i >= 2 ? "right" : "left" }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={td}><Link href={`/admin/discounts/${d.id}`} style={{ color: "#E8E2D5", textDecoration: "none", fontFamily: BODY, fontSize: 13.5, fontWeight: 600 }}>{d.code}</Link>{d.note ? <div style={sub}>{d.note}</div> : null}</td>
                <td style={td}><span style={badge(d.active)}>{d.active ? "ACTIVE" : "DRAFT"}</span></td>
                <td style={{ ...td, textAlign: "right", color: GOLD, fontFamily: MONO }}>{value(d)}</td>
                <td style={{ ...td, textAlign: "right" }}>{d.min_subtotal ? `$${Number(d.min_subtotal).toFixed(0)}` : "—"}</td>
                <td style={{ ...td, textAlign: "right" }}>{d.used_count ?? 0}{d.usage_limit ? ` / ${d.usage_limit}` : ""}</td>
                <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontSize: 11, color: "#9A948A" }}>{d.ends_at ? new Date(d.ends_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} style={{ ...td, color: "#8A847A", fontFamily: BODY }}>No discounts yet. Create one to get started.</td></tr>}
          </tbody>
        </table>
      </div>
      <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#8A847A", marginTop: 14 }}>Codes apply at checkout once payments are live. Click a code to edit its value, limits, dates and tags.</p>
    </div>
  );
}
