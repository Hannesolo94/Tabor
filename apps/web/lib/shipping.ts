// Flat-rate shipping, matching the catalog pricing model (prices are pre-shipping).
//
// Rates are AUTHORED in two currencies only:
//   INTL: USD $11.99 worldwide, free for US orders over $100
//   ZA:   ZAR R150 flat, free over R1800
// For any other display currency the USD figures are converted with the same FX
// rate and rounding rule as products, so shipping never appears in a different
// currency to the basket.
import type { RegionId } from "./region";
import { usdToContext, type PriceContext } from "./pricing";

export const SHIPPING = {
  INTL: { flat: 11.99, freeOver: 100, freeOnlyUS: true },
  ZA: { flat: 150, freeOver: 1800, freeOnlyUS: false },
} as const;

/** ISO-2 now; names kept so an older cached client payload still matches. */
const US = new Set(["US", "USA", "UNITED STATES", "UNITED STATES OF AMERICA", "U.S.", "U.S.A."]);

export function isUS(country: string): boolean {
  return US.has((country || "").trim().toUpperCase());
}

/** The flat rate and free-shipping threshold expressed in the buyer's currency. */
export function shippingTerms(region: RegionId, ctx: PriceContext): { flat: number; freeOver: number; freeOnlyUS: boolean } {
  const cfg = SHIPPING[region];
  // ZA fulfilment is authored in ZAR: use it directly when that's the currency.
  if (region === "ZA" && ctx.currency === "ZAR") return { ...cfg };
  const usd = SHIPPING.INTL;
  if (ctx.currency === "USD") return { ...usd };
  return { flat: usdToContext(usd.flat, ctx), freeOver: usdToContext(usd.freeOver, ctx), freeOnlyUS: usd.freeOnlyUS };
}

/** Shipping charge in the order's currency for a destination + merchandise subtotal. */
export function computeShipping(region: RegionId, country: string, subtotal: number, ctx: PriceContext): number {
  const t = shippingTerms(region, ctx);
  const qualifiesFree = subtotal >= t.freeOver && (!t.freeOnlyUS || isUS(country));
  return qualifiesFree ? 0 : t.flat;
}
