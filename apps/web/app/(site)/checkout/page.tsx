"use client";

// Checkout: contact + shipping + discount + summary. Posts to /api/checkout which
// recomputes prices server-side, creates the order, and starts payment via the
// configured provider (manual until a gateway is connected, then redirect).
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { track } from "@/lib/track";
import { computeShipping, isUS, SHIPPING } from "@/lib/shipping";
import type { RegionId } from "@/lib/region";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

const COUNTRIES = ["South Africa", "United States", "United Kingdom", "Canada", "Australia", "Namibia", "Botswana", "Other"];

export default function CheckoutPage() {
  const { lines, total, count, clear } = useCart();
  const sym = lines[0]?.symbol ?? "$";
  const region: RegionId = sym === "R" ? "ZA" : "INTL";
  const sub = Number(total) || 0;
  const [form, setForm] = useState({ email: "", name: "", line1: "", line2: "", city: "", province: "", postal: "", country: "South Africa" });
  const shippingAmt = lines.length ? computeShipping(region, form.country, sub) : 0;
  const grandTotal = sub + shippingAmt;
  // nudge toward the free-shipping threshold (US only on INTL; everyone on ZA)
  const cfg = SHIPPING[region];
  const freeEligible = !cfg.freeOnlyUS || isUS(form.country);
  const toFree = freeEligible && shippingAmt > 0 ? cfg.freeOver - sub : 0;
  const [discount, setDiscount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ orderId: string; message?: string } | null>(null);

  useEffect(() => { if (lines.length > 0) track("begin_checkout", { value: total }); /* eslint-disable-next-line */ }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ sku: l.sku, size: l.size, qty: l.qty })),
          email: form.email,
          shipping: { name: form.name, line1: form.line1, line2: form.line2, city: form.city, province: form.province, postal: form.postal, country: form.country },
          discountCode: discount,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Checkout failed."); setBusy(false); return; }
      // only follow a real https payment URL (guards against a tampered/rogue redirect)
      if (data.redirectUrl) {
        let safe = false;
        try { safe = new URL(data.redirectUrl).protocol === "https:"; } catch { safe = false; }
        if (safe) { window.location.href = data.redirectUrl; return; }
        setError("Payment could not start safely. Please try again."); setBusy(false); return;
      }
      track("purchase", { value: data.total, meta: { orderId: data.orderId } });
      clear();
      setDone({ orderId: data.orderId, message: data.message });
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "rgba(21,21,26,0.7)", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "13px 15px", width: "100%" };

  if (done) {
    return (
      <div style={{ background: "#0A0A0A", minHeight: "70vh", padding: "70px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 14 }}>[ ORDER RECEIVED ]</div>
          <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(36px,7vw,56px)", color: "#E8E2D5", margin: "0 0 14px" }}>Forged.</h1>
          <p style={{ fontFamily: BODY, fontSize: 15, color: "#C3BDB1", lineHeight: 1.6 }}>{done.message ?? "Your order has been received."}</p>
          <p style={{ fontFamily: MONO, fontSize: 11, color: "#8A847A", letterSpacing: "0.1em", marginTop: 16 }}>ORDER REF · {done.orderId.slice(0, 8).toUpperCase()}</p>
          <Link href="/shop" style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", borderRadius: 14, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", padding: "14px 28px", textDecoration: "none", display: "inline-block", marginTop: 26 }}>Keep shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh", padding: "50px 24px 80px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(36px,7vw,56px)", color: "#E8E2D5", margin: "0 0 6px" }}>Checkout</h1>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.14em", marginBottom: 30 }}>{count} {count === 1 ? "ITEM" : "ITEMS"} IN YOUR BAG</div>

        {lines.length === 0 ? (
          <div>
            <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A" }}>Your bag is empty.</p>
            <Link href="/shop" style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", borderRadius: 14, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", padding: "14px 28px", textDecoration: "none", display: "inline-block", marginTop: 14 }}>Shop the Drop</Link>
          </div>
        ) : (
          <form onSubmit={placeOrder} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 36 }}>
            {/* details */}
            <div style={{ display: "grid", gap: 18 }}>
              <div>
                <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", letterSpacing: "0.06em", marginBottom: 10 }}>CONTACT</div>
                <input type="email" required placeholder="Email" aria-label="Email" value={form.email} onChange={set("email")} style={inp} />
              </div>
              <div>
                <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", letterSpacing: "0.06em", marginBottom: 10 }}>SHIPPING</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <input required placeholder="Full name" aria-label="Full name" value={form.name} onChange={set("name")} style={inp} />
                  <input required placeholder="Address line 1" aria-label="Address line 1" value={form.line1} onChange={set("line1")} style={inp} />
                  <input placeholder="Address line 2 (optional)" aria-label="Address line 2" value={form.line2} onChange={set("line2")} style={inp} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input required placeholder="City" aria-label="City" value={form.city} onChange={set("city")} style={inp} />
                    <input placeholder="Province / State" aria-label="Province or state" value={form.province} onChange={set("province")} style={inp} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input required placeholder="Postal code" aria-label="Postal code" value={form.postal} onChange={set("postal")} style={inp} />
                    <select aria-label="Country" value={form.country} onChange={set("country")} style={inp}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select>
                  </div>
                </div>
              </div>
            </div>

            {/* summary + pay */}
            <div style={{ border: `1px solid ${GOLD}29`, background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))", borderRadius: 18, boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "22px 22px", alignSelf: "start" }}>
              <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", letterSpacing: "0.06em", marginBottom: 12 }}>ORDER SUMMARY</div>
              {lines.map((it) => (
                <div key={it.sku + (it.size ?? "")} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5" }}>{it.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.1em", marginTop: 2 }}>{it.size && it.size !== "One size" ? `SIZE ${it.size.toUpperCase()} · ` : ""}QTY {it.qty}</div>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: GOLD }}>{it.symbol ?? "$"}{it.price * it.qty}</div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
                <input placeholder="Discount code" aria-label="Discount code" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ ...inp, flex: 1 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: MONO, fontSize: 14, color: "#C3BDB1" }}>
                <span>SUBTOTAL</span><span>{sym}{sub.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: MONO, fontSize: 14, color: "#C3BDB1" }}>
                <span>SHIPPING</span><span>{shippingAmt === 0 ? "FREE" : `${sym}${shippingAmt.toFixed(2)}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 11, paddingTop: 11, borderTop: `1px solid ${GOLD}29`, fontFamily: MONO, fontSize: 16, color: "#E8E2D5" }}>
                <span>TOTAL</span><span style={{ color: GOLD }}>{sym}{grandTotal.toFixed(2)}</span>
              </div>
              {toFree > 0
                ? <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.08em", marginTop: 8 }}>ADD {sym}{toFree.toFixed(2)} FOR FREE SHIPPING</div>
                : <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.08em", marginTop: 8 }}>DISCOUNT APPLIED ON THE NEXT STEP</div>}

              {error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", letterSpacing: "0.04em", marginTop: 14 }}>{error}</p>}

              <button type="submit" disabled={busy} style={{ width: "100%", marginTop: 18, fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 14, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", padding: "16px", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Placing order…" : `Place order · ${sym}${grandTotal.toFixed(2)}`}
              </button>
              <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.1em", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>SHIPS WORLDWIDE · PRINTED ON DEMAND</div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
