// Order detail. Shows items, customer, fulfilment + lets you update status.
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateOrderStatus } from "../actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "paid", "fulfilled", "shipped", "cancelled", "refunded"];

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: o } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();

  let email = "guest";
  if (o.user_id) {
    const admin = supabaseAdmin();
    const { data: prof } = await admin.from("profiles").select("email").eq("user_id", o.user_id).maybeSingle();
    email = prof?.email ?? "guest";
  }
  const items = (Array.isArray(o.items) ? o.items : []) as { sku?: string; name?: string; qty?: number; quantity?: number; price?: number }[];
  const sym = o.currency === "ZAR" ? "R" : "$";

  const Row = ({ k, v }: { k: string; v: string }) => (
    <div style={{ display: "flex", gap: 14, padding: "6px 0" }}>
      <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#7A746A", letterSpacing: "0.12em", width: 120 }}>{k}</span>
      <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{v}</span>
    </div>
  );

  return (
    <div>
      <Link href="/admin/orders" style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.12em", textDecoration: "none" }}>← ORDERS</Link>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: "14px 0 4px" }}>Order #{o.id.slice(0, 8)}</h1>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.1em", marginBottom: 24 }}>{sym}{o.total ?? 0} · {String(o.status).toUpperCase()}</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" }}>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 8 }}>DETAILS</div>
          <Row k="CUSTOMER" v={email} />
          <Row k="REGION" v={o.region ?? "—"} />
          <Row k="SUPPLIER" v={o.supplier ?? "—"} />
          <Row k="PRINTFUL ID" v={o.printful_order_id ?? "—"} />
          <Row k="DATE" v={new Date(o.created_at).toISOString().slice(0, 10)} />
        </div>
        <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" }}>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 10 }}>ITEMS</div>
          {items.length === 0 ? <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#7A746A" }}>No line items.</p> : items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: "#C3BDB1" }}>{it.name ?? it.sku} × {it.qty ?? it.quantity ?? 1}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD }}>{sym}{(it.price ?? 0) * (it.qty ?? it.quantity ?? 1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* status */}
      <div style={{ marginTop: 22, border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "16px 20px" }}>
        <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#7A746A", letterSpacing: "0.14em", marginBottom: 10 }}>UPDATE STATUS</div>
        <form action={updateOrderStatus} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="hidden" name="id" value={o.id} />
          {STATUSES.map((s) => (
            <button key={s} name="status" value={s} type="submit" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", padding: "8px 12px", borderRadius: 10, border: `1px solid ${GOLD}44`, cursor: "pointer", fontWeight: o.status === s ? 700 : 400, boxShadow: o.status === s ? "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)" : undefined, color: o.status === s ? "#1a1408" : "#9A948A", background: o.status === s ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "transparent" }}>{s}</button>
          ))}
        </form>
      </div>
    </div>
  );
}
