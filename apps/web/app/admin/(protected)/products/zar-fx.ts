// The ZAR conversion figures the product editor's "Auto" button needs, read from
// the same tables the storefront prices from, so the suggestion and the live
// price can never disagree.
import { getPriceContext } from "@/lib/pricing";
import type { ZarFx } from "./PriceFields";

export async function getZarFx(): Promise<ZarFx | null> {
  const ctx = await getPriceContext("ZAR");
  if (ctx.currency !== "ZAR" || !(ctx.rate > 0)) return null;
  return { rate: ctx.rate, bufferPct: ctx.bufferPct, rule: ctx.rule, fetchedAt: ctx.fxFetchedAt };
}
