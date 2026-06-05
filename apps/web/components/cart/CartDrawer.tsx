"use client";

// Slide-in cart drawer. Reads the shared cart context, supports quantity changes
// and removal, and links to checkout (checkout flow is built next).
import Link from "next/link";
import { useCart } from "./CartProvider";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export function CartDrawer() {
  const { open, setOpen, lines, total, count, setQty, remove } = useCart();
  if (!open) return null;
  const sym = lines[0]?.symbol ?? "$";
  return (
    <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(400px, 94vw)", height: "100%", background: "#0E0E12", borderLeft: `1px solid ${GOLD}55`, padding: "28px 22px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <span style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 20, color: "#E8E2D5", letterSpacing: "0.08em" }}>
            YOUR BAG{count ? ` · ${count}` : ""}
          </span>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#9A948A", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {lines.length === 0 ? (
          <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A" }}>Your bag is empty. The drop awaits.</p>
        ) : (
          <>
            {lines.map((it) => (
              <div key={it.sku + (it.size ?? "")} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{it.name}</div>
                  {it.size && it.size !== "One size" && (
                    <div style={{ fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.1em", marginTop: 2 }}>SIZE {it.size.toUpperCase()}</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", border: `1px solid ${GOLD}44` }}>
                      <button onClick={() => setQty(it.sku, it.size, it.qty - 1)} style={{ background: "none", border: "none", color: GOLD, width: 26, height: 26, cursor: "pointer", fontSize: 14 }}>−</button>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: "#E8E2D5", minWidth: 18, textAlign: "center" }}>{it.qty}</span>
                      <button onClick={() => setQty(it.sku, it.size, it.qty + 1)} style={{ background: "none", border: "none", color: GOLD, width: 26, height: 26, cursor: "pointer", fontSize: 14 }}>+</button>
                    </div>
                    <button onClick={() => remove(it.sku, it.size)} style={{ background: "none", border: "none", color: "#6E6A60", fontSize: 10, cursor: "pointer", fontFamily: MONO, letterSpacing: "0.1em" }}>REMOVE</button>
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: GOLD, marginLeft: 12 }}>{it.symbol ?? "$"}{it.price * it.qty}</div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0", fontFamily: MONO, fontSize: 15, color: "#E8E2D5" }}>
              <span>SUBTOTAL</span>
              <span style={{ color: GOLD }}>{sym}{total}</span>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#6E6A60", letterSpacing: "0.08em", marginBottom: 14 }}>SHIPPING + TAX CALCULATED AT CHECKOUT</div>
            <Link href="/checkout" onClick={() => setOpen(false)} style={{ display: "block", textAlign: "center", textDecoration: "none", fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, padding: "15px" }}>
              Checkout
            </Link>
            <div style={{ fontFamily: MONO, fontSize: 9, color: "#6E6A60", letterSpacing: "0.1em", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
              SECURE PAYMENT · SHIPS WORLDWIDE
              <br />
              PRINTED ON DEMAND
            </div>
          </>
        )}
      </div>
    </div>
  );
}
