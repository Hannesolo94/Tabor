"use client";

// Site-wide cart. React context + localStorage so the bag persists across pages
// and reloads. Holds denormalized line items so the drawer renders without
// re-looking-up the catalog.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { track } from "@/lib/track";

export interface CartLine {
  sku: string;
  name: string;
  price: number;
  size?: string;
  qty: number;
  symbol?: string; // currency symbol for the region the item was added in
}

interface CartCtx {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (sku: string, size?: string) => void;
  setQty: (sku: string, size: string | undefined, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tabor_cart_v1";
const sameLine = (a: CartLine, sku: string, size?: string) => a.sku === sku && a.size === size;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  // hydrate from storage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    track("add_to_cart", { sku: line.sku, value: line.price * qty });
    setLines((prev) => {
      const i = prev.findIndex((l) => sameLine(l, line.sku, line.size));
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i]!, qty: next[i]!.qty + qty };
        return next;
      }
      return [...prev, { ...line, qty }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((sku: string, size?: string) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, sku, size)));
  }, []);

  const setQty = useCallback((sku: string, size: string | undefined, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !sameLine(l, sku, size))
        : prev.map((l) => (sameLine(l, sku, size) ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((a, b) => a + b.qty, 0);
    const total = lines.reduce((a, b) => a + b.price * b.qty, 0);
    return { lines, count, total, open, setOpen, add, remove, setQty, clear };
  }, [lines, open, add, remove, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
