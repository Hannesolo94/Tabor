// Orders list. Populates once checkout is live; framework is ready now.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = { pending: "#C9A961", paid: "#7BBF7B", fulfilled: "#7BBF7B", shipped: "#7BBF7B", cancelled: "#C03A3A", refunded: "#C03A3A" };

export default async function AdminOrders() {
  const sb = await supabaseServer();
  const { data, count } = await sb.from("orders").select("id, status, total, currency, region, supplier, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(200);
  const rows = data ?? [];

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ FULFILMENT ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Orders</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 24px" }}>{count ?? 0} orders. Orders flow in here automatically once checkout + payments are live.</p>

      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 90px 90px 1fr 100px", padding: "12px 18px", borderBottom: "1px solid rgba(201,169,97,0.12)", fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.12em" }}>
          <span>ORDER</span><span>TOTAL</span><span>STATUS</span><span>SUPPLIER / REGION</span><span>DATE</span>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: "26px 18px", fontFamily: BODY, fontSize: 13, color: "#9A948A" }}>No orders yet. When a customer checks out, the order appears here with its items, customer, fulfilment status, and supplier.</div>
        ) : (
          rows.map((o, i) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} style={{ textDecoration: "none", display: "grid", gridTemplateColumns: "1.4fr 90px 90px 1fr 100px", alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#C3BDB1" }}>#{o.id.slice(0, 8)}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD }}>{o.currency === "ZAR" ? "R" : "$"}{o.total ?? 0}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.06em", color: STATUS_COLOR[o.status] ?? "#9A948A", textTransform: "uppercase" }}>{o.status}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#9A948A" }}>{o.supplier ?? "—"} · {o.region ?? "—"}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#8A847A" }}>{new Date(o.created_at).toISOString().slice(0, 10)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
