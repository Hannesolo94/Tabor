// Checkout shell. Prices, currency and shipping terms are resolved on the SERVER
// so the summary can never disagree with what /api/checkout will actually charge.
// The country list is real ISO-2 codes: the old 8-item list of country NAMES was
// matched against a set of codes, which quietly sent every SA order to
// international pricing.
//
// Yoco sends a buyer back here with ?failed=1 (card declined) or ?cancelled=1 and
// the order id. That return is marked on the order (lib/checkout-return.ts) and
// the buyer is told what happened instead of landing on a silent empty form.
import { getVisitorPriceContext } from "@/lib/pricing";
import { shippingTerms } from "@/lib/shipping";
import { fulfilmentRegion } from "@/lib/region";
import { COUNTRIES, countryName } from "@/lib/currency";
import { markCheckoutReturn } from "@/lib/checkout-return";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

const NOTICE = {
  failed: "[ PAYMENT DECLINED ] Your card was not charged. Your bag is saved: try again, or use another card.",
  cancelled: "[ PAYMENT CANCELLED ] Nothing was charged. Your bag is saved whenever you are ready.",
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const kind = one(sp.failed) ? "failed" : one(sp.cancelled) ? "cancelled" : null;
  if (kind) await markCheckoutReturn(one(sp.order), kind);

  const ctx = await getVisitorPriceContext();
  // Default the destination to a country that actually uses the currency the
  // visitor is being shown, so the first render is self-consistent.
  const defaultCountry = ctx.currency === "ZAR" ? "ZA" : "US";
  const terms = shippingTerms(fulfilmentRegion(defaultCountry), ctx);
  const countries = [...COUNTRIES].sort((a, b) => countryName(a).localeCompare(countryName(b)));
  return <CheckoutForm terms={terms} countries={countries} defaultCountry={defaultCountry} notice={kind ? NOTICE[kind] : undefined} />;
}
