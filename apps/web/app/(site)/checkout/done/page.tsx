// Order confirmation. Yoco sends the buyer here after the hosted checkout.
//
// This page REPORTS the order's state, it does not decide it. Landing here is
// not proof of payment: anyone can visit the URL, and Yoco's own docs say never
// to treat successUrl as confirmation. The status shown is whatever the webhook
// has actually written, which is why it can legitimately say "processing" for a
// few seconds before flipping to confirmed.
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";
import { ClearCart } from "./ClearCart";

export const dynamic = "force-dynamic";

interface Line { sku: string; name: string; size: string | null; qty: number; price: number }

function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

const STATES: Record<string, { eyebrow: string; title: string; body: string; tone: string }> = {
  paid: {
    eyebrow: "[ ORDER CONFIRMED ]",
    title: "Your order is in.",
    body: "Payment received. We are sending it to production now, and you will get an email with the details.",
    tone: "#4ADE80",
  },
  pending_payment: {
    eyebrow: "[ CONFIRMING ]",
    title: "Confirming your payment.",
    body: "This usually takes a few seconds. This page refreshes on its own, so you can leave it open.",
    tone: GOLD,
  },
  payment_failed: {
    eyebrow: "[ PAYMENT DECLINED ]",
    title: "That payment did not go through.",
    body: "Nothing has been charged. You can try again with another card, and your bag is still as you left it.",
    tone: "#F87171",
  },
  refunded: {
    eyebrow: "[ REFUNDED ]",
    title: "This order has been refunded.",
    body: "The money is on its way back to the card you paid with. Banks usually take a few working days.",
    tone: "#A6A6B4",
  },
};

export default async function OrderDonePage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;

  const wrap: React.CSSProperties = { maxWidth: 680, margin: "0 auto", padding: "clamp(48px,9vh,110px) 20px 90px" };
  const card: React.CSSProperties = {
    border: `1px solid ${GOLD}29`,
    background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))",
    borderRadius: 18,
    boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
    padding: "24px 24px",
    marginTop: 26,
  };

  if (!orderId) {
    return (
      <div style={wrap}>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>No order to show.</h1>
        <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A" }}>This link is missing its order reference.</p>
        <Link href="/shop" style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.12em" }}>← BACK TO THE SHOP</Link>
      </div>
    );
  }

  const { data: order } = await admin()
    .from("orders")
    .select("id,status,currency,total,subtotal,shipping_amount,discount_amount,discount_code,items,email,settlement_currency,settlement_amount,created_at")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return (
      <div style={wrap}>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>We cannot find that order.</h1>
        <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A" }}>If you were charged, email us and we will sort it out straight away.</p>
        <Link href="/shop" style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.12em" }}>← BACK TO THE SHOP</Link>
      </div>
    );
  }

  const state = STATES[order.status as string] ?? STATES.pending_payment;
  const lines = (order.items ?? []) as Line[];
  const sym = String(order.currency) === "ZAR" ? "R" : String(order.currency) === "USD" ? "$" : "";
  const money = (n: number) => `${sym}${Number(n).toFixed(2)}${sym ? "" : " " + order.currency}`;
  // Yoco settles in rand, so an international buyer's card shows a different
  // number to the one they agreed to. Say so rather than let it surprise them.
  const settledDifferently =
    order.settlement_currency && order.settlement_currency !== order.currency && order.settlement_amount != null;

  return (
    <div style={wrap}>
      <ClearCart active={order.status === "paid"} />
      {order.status === "pending_payment" && <meta httpEquiv="refresh" content="5" />}

      <div style={{ fontFamily: MONO, fontSize: 10, color: state.tone, letterSpacing: "0.24em", marginBottom: 10 }}>{state.eyebrow}</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "clamp(28px,5vw,42px)", color: "#E8E2D5", margin: 0, lineHeight: 1.1 }}>{state.title}</h1>
      <p style={{ fontFamily: BODY, fontSize: 15.5, color: "#C3BDB1", maxWidth: "56ch", marginTop: 14, lineHeight: 1.6 }}>{state.body}</p>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em" }}>ORDER</div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: "#E8E2D5" }}>{String(order.id).slice(0, 8).toUpperCase()}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em" }}>CONFIRMATION SENT TO</div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: "#E8E2D5" }}>{String(order.email)}</div>
          </div>
        </div>

        {lines.map((l) => (
          <div key={l.sku + (l.size ?? "")} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{l.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.1em", marginTop: 2 }}>
                {l.size && l.size !== "One size" ? `SIZE ${String(l.size).toUpperCase()} · ` : ""}QTY {l.qty}
              </div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: GOLD }}>{money(l.price * l.qty)}</div>
          </div>
        ))}

        <Row label="SUBTOTAL" value={money(Number(order.subtotal ?? 0))} />
        {Number(order.discount_amount) > 0 && <Row label={`DISCOUNT${order.discount_code ? ` · ${order.discount_code}` : ""}`} value={`- ${money(Number(order.discount_amount))}`} />}
        <Row label="SHIPPING" value={Number(order.shipping_amount) === 0 ? "FREE" : money(Number(order.shipping_amount))} />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GOLD}29`, fontFamily: MONO, fontSize: 16, color: "#E8E2D5" }}>
          <span>TOTAL</span><span style={{ color: GOLD }}>{money(Number(order.total))}</span>
        </div>

        {settledDifferently && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.05em", marginTop: 10, lineHeight: 1.6 }}>
            CHARGED AS {order.settlement_currency} {Number(order.settlement_amount).toFixed(2)} · YOUR BANK MAY ADD A FOREIGN TRANSACTION FEE
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 26, flexWrap: "wrap" }}>
        <Link href="/shop" style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.12em", textDecoration: "none" }}>← KEEP LOOKING</Link>
        {order.status === "payment_failed" && (
          <Link href="/checkout" style={{ fontFamily: MONO, fontSize: 11, color: "#E8E2D5", letterSpacing: "0.12em", textDecoration: "none" }}>TRY AGAIN →</Link>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: MONO, fontSize: 13, color: "#C3BDB1" }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
