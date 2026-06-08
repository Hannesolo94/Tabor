// Orders list. Shopify-style table with payment + fulfillment status. Populates once
// checkout is live; the framework is ready now.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";
const GREEN = "#5FB07A";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "8px 16px 14px" };
const th: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 8px", fontWeight: 400 };
const td: React.CSSProperties = { padding: "13px 8px", fontFamily: BODY, fontSize: 13, color: "#C3BDB1", verticalAlign: "middle" };
function pill(on: boolean, label: string): React.CSSProperties {
  return { fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 8, color: on ? GREEN : GOLD, border: `1px solid ${on ? "rgba(95,176,122,0.4)" : "rgba(201,169,97,0.4)"}`, background: on ? "rgba(95,176,122,0.08)" : "rgba(201,169,97,0.08)", display: "inline-block" };
}

interface Row { id: string; printful_order_id: string | null; status: string; total: number | null; currency: string | null; created_at: string; email: string | null; items: unknown }

export default async function AdminOrders() {
  const sb = await supabaseServer();
  const { data, count } = await sb.from("orders").select("id, printful_order_id, status, total, currency, created_at, email, items", { count: "exact" }).order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as Row[];
  const paid = (s: string) => ["paid", "fulfilled", "shipped"].includes(s);
  const fulfilled = (s: string) => ["fulfilled", "shipped"].includes(s);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ FULFILMENT ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Orders</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>{count ?? 0} orders. They flow in automatically once checkout + payments are live.</p>
      </div>

      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Order", "Date", "Customer", "Payment", "Fulfillment", "Items", "Total"].map((h, i) => <th key={h} style={{ ...th, textAlign: i >= 5 ? "right" : "left" }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((o) => {
              const items = Array.isArray(o.items) ? o.items : [];
              const sym = o.currency === "ZAR" ? "R" : "$";
              return (
                <tr key={o.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={td}><Link href={`/admin/orders/${o.id}`} style={{ color: "#E8E2D5", textDecoration: "none", fontFamily: MONO, fontSize: 12.5, fontWeight: 600 }}>{o.printful_order_id ? `#${o.printful_order_id}` : `#${o.id.slice(0, 8)}`}</Link></td>
                  <td style={{ ...td, fontFamily: MONO, fontSize: 11, color: "#9A948A" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={td}>{o.email ?? "guest"}</td>
                  <td style={td}><span style={pill(paid(o.status), "")}>{paid(o.status) ? "PAID" : o.status === "refunded" ? "REFUNDED" : "PENDING"}</span></td>
                  <td style={td}><span style={pill(fulfilled(o.status), "")}>{fulfilled(o.status) ? "FULFILLED" : "UNFULFILLED"}</span></td>
                  <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontSize: 12 }}>{items.length}</td>
                  <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontSize: 13, color: GOLD }}>{sym}{Number(o.total ?? 0).toFixed(2)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} style={{ ...td, color: "#8A847A", fontFamily: BODY }}>No orders yet. When a customer checks out, the order appears here with items, customer, payment + fulfillment status.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
