"use client";

// The buyer left for Yoco's hosted page and came back, so the bag is still full
// of things they have now paid for. Empty it once, only on a confirmed order.
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function ClearCart({ active }: { active: boolean }) {
  const { clear } = useCart();
  const done = useRef(false);
  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;
    clear();
  }, [active, clear]);
  return null;
}
