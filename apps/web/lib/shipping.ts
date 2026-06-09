// Flat-rate shipping, matching the catalog pricing model (prices are pre-shipping).
//   INTL (USD): $11.99 worldwide, FREE for US orders over $100.
//   ZA (ZAR):  flat R150, free over R1800. (Adjust these as local fulfilment firms up.)
// Used by BOTH the checkout API (authoritative) and the checkout page (display).
import type { RegionId } from "./region";

const US_NAMES = new Set(["US", "USA", "UNITED STATES", "UNITED STATES OF AMERICA", "U.S.", "U.S.A."]);

export const SHIPPING = {
  INTL: { flat: 11.99, freeOver: 100, freeOnlyUS: true },
  ZA: { flat: 150, freeOver: 1800, freeOnlyUS: false },
} as const;

export function isUS(country: string): boolean {
  return US_NAMES.has((country || "").trim().toUpperCase());
}

/** Shipping charge in the order's currency for a region + destination + merchandise subtotal. */
export function computeShipping(region: RegionId, country: string, subtotal: number): number {
  const cfg = SHIPPING[region];
  const qualifiesFree = subtotal >= cfg.freeOver && (!cfg.freeOnlyUS || isUS(country));
  return qualifiesFree ? 0 : cfg.flat;
}
