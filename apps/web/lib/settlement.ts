// Converting the agreed total into the currency the gateway actually settles in.
//
// The rule, and it matters: the basket total in the BUYER'S currency is what they
// agreed to. The settlement amount is that exact figure converted once, with no
// further rounding and no second margin buffer, because the buffer is already
// baked into the displayed price.
//
// Get this wrong and a German who agreed to EUR26.99 gets billed R499, which is
// EUR28.10, and you have manufactured a complaint out of rounding.
import { getPriceContext, type PriceContext } from "./pricing";

/** Gateways settle in this. Yoco is ZAR only. */
export const SETTLEMENT_CURRENCY = "ZAR";

export interface Settlement {
  currency: string;
  amount: number;   // in `currency`
  rate: number;     // settlement amount / agreed total
}

/**
 * @param total  the order total in the buyer's display currency
 * @param ctx    the price context that produced that total
 */
export async function settlementFor(total: number, ctx: PriceContext): Promise<Settlement> {
  // Already in the settlement currency: charge exactly what was displayed.
  if (ctx.currency === SETTLEMENT_CURRENCY) {
    return { currency: SETTLEMENT_CURRENCY, amount: round2(total), rate: 1 };
  }

  const zar = await getPriceContext(SETTLEMENT_CURRENCY);
  // ctx.rate is units-per-USD for the display currency; same for zar.rate.
  // total(display) -> USD -> ZAR, in one step, no rounding rules applied.
  if (!(ctx.rate > 0) || !(zar.rate > 0) || zar.currency !== SETTLEMENT_CURRENCY) {
    // No usable rate. Fall back to charging the displayed figure as-is rather
    // than inventing a number; the order still records what was agreed.
    return { currency: ctx.currency, amount: round2(total), rate: 1 };
  }

  const rate = zar.rate / ctx.rate;
  return { currency: SETTLEMENT_CURRENCY, amount: round2(total * rate), rate: round6(rate) };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;
