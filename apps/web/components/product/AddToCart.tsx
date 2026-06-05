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
    add({ sku: p.sku, name: p.name, price: p.price, size }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div>
      {hasSizes && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.18em", marginBottom: 8 }}>SIZE</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.sizes!.map((s) => (
              <button key={s} onClick={() => setSize(s)} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", minWidth: 46, padding: "10px 12px", cursor: "pointer", color: size === s ? "#0A0A0A" : "#C3BDB1", background: size === s ? `linear-gradient(180deg,#E8D08C,${GOLD})` : "transparent", border: `1px solid ${GOLD}55` }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", border: `1px solid ${GOLD}55` }}>
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ background: "none", border: "none", color: GOLD, width: 38, height: 46, cursor: "pointer", fontSize: 16 }}>−</button>
          <span style={{ fontFamily: MONO, fontSize: 14, color: "#E8E2D5", minWidth: 26, textAlign: "center" }}>{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} style={{ background: "none", border: "none", color: GOLD, width: 38, height: 46, cursor: "pointer", fontSize: 16 }}>+</button>
        </div>
        <button onClick={onAdd} style={{ flex: 1, minWidth: 200, fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "15px 24px", cursor: "pointer" }}>
          {added ? "Added to bag ✓" : `Add to Bag · $${p.price * qty}`}
        </button>
      </div>
    </div>
  );
}
