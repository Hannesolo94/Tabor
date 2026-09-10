// Checkout shell. Prices, currency and shipping terms are resolved on the SERVER
// so the summary can never disagree with what /api/checkout will actually charge.
// The country list is real ISO-2 codes: the old 8-item list of country NAMES was
// matched against a set of codes, which quietly sent every SA order to
// international pricing.
import { getVisitorPriceContext } from "@/lib/pricing";
import { shippingTerms } from "@/lib/shipping";
import { fulfilmentRegion } from "@/lib/region";
import { COUNTRIES, countryName } from "@/lib/currency";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const ctx = await getVisitorPriceContext();
  // Default the destination to a country that actually uses the currency the
  // visitor is being shown, so the first render is self-consistent.
  const defaultCountry = ctx.currency === "ZAR" ? "ZA" : "US";
  const terms = shippingTerms(fulfilmentRegion(defaultCountry), ctx);
  const countries = [...COUNTRIES].sort((a, b) => countryName(a).localeCompare(countryName(b)));
  return <CheckoutForm terms={terms} countries={countries} defaultCountry={defaultCountry} />;
}
