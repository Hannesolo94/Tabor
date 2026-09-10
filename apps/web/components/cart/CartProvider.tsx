"use client";

// Site-wide cart. React context + localStorage so the bag persists across pages
// and reloads. Holds denormalized line items so the drawer renders without
// re-looking-up the catalog.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  /** True once the bag has been read back from storage. Anything that MUTATES
   *  the bag on mount must wait for this: React runs child effects before
   *  parent ones, so a child clearing the bag first would simply be overwritten
   *  by this provider's hydrate. */
  hydrated: boolean;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "tabor_cart_v1";
const sameLine = (a: CartLine, sku: string, size?: string) => a.sku === sku && a.size === size;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const revalidated = useRef(false);

  // hydrate from storage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) { setHydrated(true); return; }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // keep only well-formed lines (guards against old/corrupt blobs)
        setLines(parsed.filter((l) => l && typeof l.sku === "string" && typeof l.price === "number" && typeof l.qty === "number"));
      }
    } catch {
      /* ignore */
    } finally {
      setHydrated(true);
    }
  }, []);

  // Reconcile the stored bag with the live catalogue once, after hydration.
  // Carts persist forever in localStorage, so they drift: products get
  // unpublished, prices move, and the visitor's currency may have changed since
  // the item went in. Dropping dead lines here is what stops checkout dead-ending
  // on "no longer available" with no way for the buyer to clear it.
  useEffect(() => {
    if (!hydrated || lines.length === 0 || revalidated.current) return;
    revalidated.current = true;
    const skus = [...new Set(lines.map((l) => l.sku))];
    (async () => {
      try {
        const res = await fetch("/api/cart/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skus }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { items?: { sku: string; name: string; price: number; symbol: string }[] };
        const live = new Map((data.items ?? []).map((i) => [i.sku, i]));
        setLines((prev) =>
          prev
            .filter((l) => live.has(l.sku))              // gone from the catalogue
            .map((l) => {
              const cur = live.get(l.sku)!;
              return { ...l, name: cur.name, price: cur.price, symbol: cur.symbol };
            }),
        );
      } catch {
        // Offline or the endpoint is down: leave the bag alone. Checkout still
        // recomputes server-side, so a stale bag can never be charged wrongly.
      }
    })();
  }, [hydrated, lines]);

  useEffect(() => {
    // Don't write an empty bag over a stored one before hydration has run.
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    track("add_to_cart", { sku: line.sku, value: line.price * qty });
    setLines((prev) => {
      // Never mix currencies: if the region/currency changed, start a fresh bag.
      if (prev.length > 0 && (prev[0]!.symbol ?? "$") !== (line.symbol ?? "$")) {
        return [{ ...line, qty }];
      }
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
    return { lines, count, total, open, setOpen, add, remove, setQty, clear, hydrated };
  }, [lines, open, add, remove, setQty, clear, hydrated]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
