"use client";

// Checkout — order summary + contact/shipping placeholder. The payment step is
// wired to Peach Payments once the merchant account is live (gateway-agnostic
// scaffold for now). Region/currency + live shipping rates come with that work.
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { track } from "@/lib/track";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export default function CheckoutPage() {
  const { lines, total, count } = useCart();

  useEffect(() => {
    if (lines.length > 0) track("begin_checkout", { value: total });
    // fire once on entering checkout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh", padding: "50px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(36px,7vw,56px)", color: "#E8E2D5", margin: "0 0 6px" }}>Checkout</h1>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.14em", marginBottom: 30 }}>{count} {count === 1 ? "ITEM" : "ITEMS"} IN YOUR BAG</div>

        {lines.length === 0 ? (
          <div>
            <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A" }}>Your bag is empty.</p>
            <Link href="/shop" style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, padding: "13px 26px", textDecoration: "none", display: "inline-block", marginTop: 14 }}>Shop the Drop</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 36 }}>
            {/* summary */}
            <div>
              <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 16, color: "#E8E2D5", letterSpacing: "0.06em", marginBottom: 14 }}>ORDER SUMMARY</div>
              {lines.map((it) => (
                <div key={it.sku + (it.size ?? "")} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{it.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.1em", marginTop: 2 }}>
                      {it.size && it.size !== "One size" ? `SIZE ${it.size.toUpperCase()} · ` : ""}QTY {it.qty}
                    </div>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: GOLD }}>${it.price * it.qty}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontFamily: MONO, fontSize: 15, color: "#E8E2D5" }}>
                <span>SUBTOTAL</span>
                <span style={{ color: GOLD }}>${total}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#6E6A60", letterSpacing: "0.08em", marginTop: 6 }}>SHIPPING + TAX CALCULATED BY REGION AT PAYMENT</div>
            </div>

            {/* payment placeholder */}
            <div style={{ border: `1px solid ${GOLD}33`, background: "#0E0E12", padding: "24px 22px" }}>
              <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 16, color: "#E8E2D5", letterSpacing: "0.06em", marginBottom: 14 }}>PAYMENT</div>
              <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", lineHeight: 1.65 }}>
                Secure checkout is being wired up. Cards and local payment methods will be live here shortly, with region-based pricing and worldwide shipping.
              </p>
              <button disabled style={{ width: "100%", marginTop: 16, fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "15px", opacity: 0.5, cursor: "not-allowed" }}>
                Pay ${total}
              </button>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#6E6A60", letterSpacing: "0.1em", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>SECURE PAYMENT · SHIPS WORLDWIDE<br />PRINTED ON DEMAND</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
