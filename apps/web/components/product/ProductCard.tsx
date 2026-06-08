"use client";

// Product card: clickable art + name + price linking to the PDP, plus a quick
// "Add to bag" that adds the default variant straight to the cart.
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { ProductArt } from "./ProductArt";
import { GOLD, MONO, CINZEL } from "@/lib/ui";
import { personaById, type Product } from "@/lib/catalog";

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const persona = personaById(p.persona);
  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add({ sku: p.sku, name: p.name, price: p.price, size: p.sizes?.[0], symbol: p.currencySymbol });
  };
  return (
    <Link href={`/product/${p.sku}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="tabor-lift" style={{ border: "1px solid rgba(201,169,97,0.16)", background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))", borderRadius: 18, boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <div style={{ borderBottom: "1px solid rgba(201,169,97,0.16)" }}>
          <ProductArt p={p} />
        </div>
        <div style={{ padding: "14px 15px" }}>
          <div style={{ fontFamily: MONO, fontSize: 8.5, color: persona?.accent ?? GOLD, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {persona?.name ?? ""}
          </div>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5", marginTop: 4 }}>{p.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.1em", marginTop: 3 }}>{p.note.toUpperCase()}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 15, color: GOLD }}>{p.currencySymbol}{p.price}</span>
            {p.inStock ? (
              <button
                onClick={onAdd}
                style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 12, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", fontWeight: 700, padding: "9px 14px", cursor: "pointer", textTransform: "uppercase" }}
              >
                Add to Bag
              </button>
            ) : (
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "#7A746A", border: "1px solid #3A3A40", borderRadius: 10, padding: "9px 14px", textTransform: "uppercase" }}>Sold Out</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
