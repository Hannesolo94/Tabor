// FULFILMENT region: who makes and ships the order, and therefore what it costs
// us. This is NOT the buyer's currency. Currency lives in pricing.ts and comes
// from the visitor's country; a Namibian pays ZAR but ships from SA, an
// Australian pays AUD but ships from Printful.
//
// ZA fulfilment is the Common Monetary Area, where an SA print partner can
// deliver at sane cost. Everywhere else routes to Printful.
export type RegionId = "ZA" | "INTL";

/** Legacy cookie from the two-region era. Read for back-compat, no longer set. */
export const REGION_COOKIE = "tabor_region";

const ZA_FULFILMENT = new Set(["ZA", "NA", "LS", "SZ"]);

/** Which supplier/shipping model serves this destination. */
export function fulfilmentRegion(cc: string | null | undefined): RegionId {
  return cc && ZA_FULFILMENT.has(cc.toUpperCase()) ? "ZA" : "INTL";
}

/**
 * Back-compat alias. NOTE: this now expects an ISO-2 country CODE, not a name.
 * The old checkout passed "South Africa" here against a set of codes, which
 * silently sent every SA order to international pricing.
 */
export const regionForCountry = fulfilmentRegion;
