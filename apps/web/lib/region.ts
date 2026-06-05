// Region + currency. Two regions for now: ZA (South Africa / Africa, cheaper
// local pricing in ZAR) and INTL (everyone else, USD). The visitor's region sets
// the DISPLAYED price/currency; the shipping address LOCKS the real price at
// checkout (so the lower SA price can't be exploited from abroad).
import { cookies } from "next/headers";

export type RegionId = "ZA" | "INTL";

export const REGIONS: Record<RegionId, { code: string; symbol: string; label: string }> = {
  ZA: { code: "ZAR", symbol: "R", label: "South Africa" },
  INTL: { code: "USD", symbol: "$", label: "International" },
};

export const REGION_COOKIE = "tabor_region";

// African ISO-2 country codes get the local (ZA) price book.
const AFRICA = new Set([
  "ZA", "NA", "BW", "ZW", "MZ", "LS", "SZ", "ZM", "MW", "AO", "KE", "TZ", "UG", "RW", "NG", "GH",
  "ET", "CD", "CG", "CM", "CI", "SN", "ML", "BF", "BJ", "TG", "NE", "GA", "GQ", "MG", "MU", "EG",
  "MA", "DZ", "TN", "LY", "SD", "SS", "SO", "BI", "DJ", "ER", "GM", "GN", "GW", "LR", "SL", "TD",
  "CF", "MR", "CV", "KM", "SC", "ST",
]);

export function regionForCountry(cc: string | null | undefined): RegionId {
  return cc && AFRICA.has(cc.toUpperCase()) ? "ZA" : "INTL";
}

/** Region from the cookie (set by middleware from geo, or by the switcher). */
export async function getRegion(): Promise<RegionId> {
  const c = await cookies();
  return c.get(REGION_COOKIE)?.value === "ZA" ? "ZA" : "INTL";
}
