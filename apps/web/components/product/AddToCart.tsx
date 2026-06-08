"use client";

// Add-to-cart island for the PDP: size selector (when applicable) + quantity +
// add button. Lives in the cart context.
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { GOLD, MONO, CINZEL } from "@/lib/ui";
import type { Product } from "@/lib/catalog";

export function AddToCart({ p }: { p: Product }) {
  const { add } = useCart();
  const hasSizes = !!p.sizes && p.sizes.length > 0 && p.sizes[0] !== "One size";
  const [size, setSize] = useState<string | undefined>(p.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    add({ sku: p.sku, name: p.name, price: p.price, size, symbol: p.currencySymbol }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  if (!p.inStock) {
    return (
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A746A", border: "1px solid #3A3A40", borderRadius: 14, padding: "15px 24px", textAlign: "center" }}>
        Sold Out
      </div>
    );
  }

  return (
    <div>
      {hasSizes && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.18em", marginBottom: 8 }}>SIZE</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.sizes!.map((s) => (
              <button key={s} onClick={() => setSize(s)} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", minWidth: 46, padding: "10px 12px", cursor: "pointer", borderRadius: 12, fontWeight: size === s ? 700 : 400, color: size === s ? "#1a1408" : "#C3BDB1", background: size === s ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.05)", border: `1px solid ${GOLD}${size === s ? "00" : "33"}`, boxShadow: size === s ? "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)" : "none" }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", border: `1px solid ${GOLD}33`, borderRadius: 12, background: "rgba(201,169,97,0.05)" }}>
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ background: "none", border: "none", color: GOLD, width: 38, height: 46, cursor: "pointer", fontSize: 16 }}>−</button>
          <span style={{ fontFamily: MONO, fontSize: 14, color: "#E8E2D5", minWidth: 26, textAlign: "center" }}>{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} style={{ background: "none", border: "none", color: GOLD, width: 38, height: 46, cursor: "pointer", fontSize: 16 }}>+</button>
        </div>
        <button onClick={onAdd} style={{ flex: 1, minWidth: 200, fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 14, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", padding: "15px 24px", cursor: "pointer" }}>
          {added ? "Added to bag ✓" : `Add to Bag · ${p.currencySymbol}${p.price * qty}`}
        </button>
      </div>
    </div>
  );
}
