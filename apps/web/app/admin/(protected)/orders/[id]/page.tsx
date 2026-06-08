// Order detail — Shopify-style: fulfillment + items + payment + timeline (left),
// customer / address / notes / tags (right rail).
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateOrderStatus, saveOrderMeta } from "../actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";
const STATUSES = ["pending", "paid", "fulfilled", "shipped", "cancelled", "refunded"];
const GREEN = "#5FB07A";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const sectionH: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", marginTop: 16, marginBottom: 6 };
const detail: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#C3BDB1", lineHeight: 1.55 };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "9px 11px", width: "100%" };

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="admin-card" style={cardStyle}>
      {(title || action) && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{title}</span>{action}</div>}
      {children}
    </div>
  );
}
function Badge({ on, on_label, off_label }: { on: boolean; on_label: string; off_label: string }) {
  return <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", padding: "4px 9px", borderRadius: 8, color: on ? GREEN : GOLD, border: `1px solid ${on ? "rgba(95,176,122,0.4)" : "rgba(201,169,97,0.4)"}`, background: on ? "rgba(95,176,122,0.08)" : "rgba(201,169,97,0.08)" }}>{on ? on_label : off_label}</span>;
}
function PayRow({ k, v, bold, accent }: { k: string; v: string; bold?: boolean; accent?: boolean }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}><span style={{ fontFamily: BODY, fontSize: 13, color: bold ? "#E8E2D5" : "#9A948A", fontWeight: bold ? 700 : 400 }}>{k}</span><span style={{ fontFamily: MONO, fontSize: 13, color: accent ? GOLD : bold ? "#E8E2D5" : "#C3BDB1", fontWeight: bold ? 700 : 400 }}>{v}</span></div>;
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: o } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (!o) notFound();

  const admin = supabaseAdmin();
  let email = o.email || "guest", custOrders = 0;
  if (o.user_id) {
    const { data: prof } = await admin.from("profiles").select("email").eq("user_id", o.user_id).maybeSingle();
    email = o.email || prof?.email || "guest";
    const { count } = await admin.from("orders").select("id", { count: "exact", head: true }).eq("user_id", o.user_id);
    custOrders = count ?? 0;
  }
  const items = (Array.isArray(o.items) ? o.items : []) as { sku?: string; name?: string; qty?: number; quantity?: number; price?: number; variant?: string }[];
  const sym = o.currency === "ZAR" ? "R" : "$";
  const n = (v: unknown) => Number(v || 0);
  const paid = ["paid", "fulfilled", "shipped"].includes(o.status);
  const fulfilled = ["fulfilled", "shipped"].includes(o.status);
  const ship = (o.shipping ?? {}) as Record<string, string>;
  const addrName = ship.name || ship.full_name || "";
  const addrLines = [ship.address1 || ship.address || ship.street, ship.address2, [ship.city, ship.state_code || ship.state, ship.zip || ship.postal_code].filter(Boolean).join(", "), ship.country_code || ship.country].filter(Boolean) as string[];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/orders" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>‹ ORDERS</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 25, color: "#E8E2D5", margin: 0 }}>{o.printful_order_id ? `#${o.printful_order_id}` : `Order #${o.id.slice(0, 8)}`}</h1>
          <Badge on={paid} on_label="PAID" off_label="PENDING" />
          <Badge on={fulfilled} on_label="FULFILLED" off_label="UNFULFILLED" />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: "#8A847A", marginTop: 6 }}>{new Date(o.created_at).toLocaleString()} · {o.supplier || "store"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, alignItems: "start" }}>
        {/* left */}
        <div style={{ display: "grid", gap: 16 }}>
          <Card title={fulfilled ? "Fulfilled" : "Unfulfilled"}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.08em", marginBottom: 12 }}>{(o.supplier || "TABOR").toUpperCase()}{o.region ? ` · ${o.region}` : ""}</div>
            {items.length === 0 ? <p style={detail}>No line items.</p> : items.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ minWidth: 0 }}><div style={{ fontFamily: BODY, fontSize: 13.5, color: "#E8E2D5", fontWeight: 600 }}>{it.name ?? it.sku}</div>{(it.variant || it.sku) && <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", marginTop: 2 }}>{it.variant ? `${it.variant} · ` : ""}{it.sku ?? ""}</div>}</div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: "#9A948A", whiteSpace: "nowrap" }}>{sym}{n(it.price).toFixed(2)} × {it.qty ?? it.quantity ?? 1}</div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: GOLD, whiteSpace: "nowrap" }}>{sym}{(n(it.price) * (it.qty ?? it.quantity ?? 1)).toFixed(2)}</div>
              </div>
            ))}
            <form action={updateOrderStatus} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <input type="hidden" name="id" value={o.id} />
              {STATUSES.map((s) => (
                <button key={s} name="status" value={s} type="submit" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.06em", textTransform: "uppercase", padding: "8px 12px", borderRadius: 10, border: `1px solid ${GOLD}33`, cursor: "pointer", fontWeight: o.status === s ? 700 : 400, boxShadow: o.status === s ? "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)" : undefined, color: o.status === s ? "#1a1408" : "#9A948A", background: o.status === s ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "transparent" }}>{s}</button>
              ))}
            </form>
          </Card>

          <Card title={paid ? "Paid" : "Payment"}>
            <PayRow k={`Subtotal${items.length ? ` (${items.length} item${items.length === 1 ? "" : "s"})` : ""}`} v={`${sym}${n(o.subtotal ?? o.total).toFixed(2)}`} />
            {o.discount_amount ? <PayRow k={`Discount${o.discount_code ? ` · ${o.discount_code}` : ""}`} v={`-${sym}${n(o.discount_amount).toFixed(2)}`} /> : null}
            <PayRow k="Shipping" v={o.shipping_amount ? `${sym}${n(o.shipping_amount).toFixed(2)}` : "—"} />
            <PayRow k="Total" v={`${sym}${n(o.total).toFixed(2)}`} bold />
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 6, paddingTop: 4 }}>
              <PayRow k={paid ? "Paid" : "Amount due"} v={`${sym}${n(o.total).toFixed(2)}`} bold accent />
            </div>
            {o.payment_provider && <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", marginTop: 8 }}>via {o.payment_provider}{o.payment_ref ? ` · ${o.payment_ref}` : ""}</div>}
          </Card>

          <Card title="Timeline">
            <div style={{ ...detail, paddingLeft: 14, borderLeft: "1px solid rgba(201,169,97,0.2)" }}>
              <div style={{ marginBottom: 8 }}>● Order placed <span style={{ color: "#7A746A", fontFamily: MONO, fontSize: 10 }}>{new Date(o.created_at).toLocaleString()}</span></div>
              {paid && <div style={{ marginBottom: 8 }}>● Payment captured{o.payment_provider ? ` via ${o.payment_provider}` : ""}</div>}
              {fulfilled && <div>● Order fulfilled</div>}
            </div>
          </Card>
        </div>

        {/* right rail */}
        <div style={{ display: "grid", gap: 14 }}>
          <Card title="Customer">
            <div style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5", fontWeight: 600 }}>{addrName || email}</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", marginTop: 2 }}>{custOrders} order{custOrders === 1 ? "" : "s"}</div>
            <div style={sectionH}>CONTACT</div>
            <div style={detail}>{email}</div>
            {ship.phone && <div style={detail}>{ship.phone}</div>}
            {addrLines.length > 0 && (
              <>
                <div style={sectionH}>SHIPPING ADDRESS</div>
                {addrName && <div style={detail}>{addrName}</div>}
                {addrLines.map((l, i) => <div key={i} style={detail}>{l}</div>)}
              </>
            )}
          </Card>

          <form action={saveOrderMeta}>
            <input type="hidden" name="id" value={o.id} />
            <Card title="Notes & tags" action={<button type="submit" style={{ fontFamily: MONO, fontSize: 9, color: GOLD, background: "transparent", border: 0, cursor: "pointer", letterSpacing: "0.1em" }}>SAVE</button>}>
              <textarea name="notes" defaultValue={o.notes ?? ""} placeholder="Add a private note about this order…" style={{ ...inp, height: 70, resize: "vertical" }} />
              <div style={sectionH}>TAGS</div>
              <input name="tags" defaultValue={(o.tags ?? []).join(", ")} placeholder="comma, separated" style={inp} />
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
