"use client";

// The buyer left for Yoco's hosted page and came back, so the bag is still full
// of things they have now paid for. Empty it once, only on a confirmed order.
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function ClearCart({ active }: { active: boolean }) {
  const { clear, hydrated } = useCart();
  const done = useRef(false);
  useEffect(() => {
    // Wait for hydration. Clearing first just gets overwritten, because React
    // runs this child effect before the provider's own read-from-storage.
    if (!hydrated || !active || done.current) return;
    done.current = true;
    clear();
  }, [hydrated, active, clear]);
  return null;
}
