// Country -> currency, and the rounding rules that turn a raw FX conversion into
// a price a human would actually put on a shelf.
//
// Rule: we only display a currency we can charge in. Anything not mapped here
// falls back to USD, which PayPal settles everywhere we sell.

/** ISO-3166-1 alpha-2, every country Printful will ship to plus the rest. */
export const COUNTRIES: string[] =
  ("AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BY BZ " +
   "CA CD CF CG CH CI CL CM CN CO CR CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FO FR " +
   "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IS IT " +
   "JE JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH " +
   "MK ML MM MN MO MP MQ MR MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NZ OM PA PE PF PG PH " +
   "PK PL PR PT PW PY QA RE RO RS RU RW SA SB SC SE SG SI SK SL SM SN SO SR ST SV SZ TC TD TG TH " +
   "TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WS YE ZA ZM ZW").split(" ");

/** Localised country name for a code. Falls back to the code itself. */
export function countryName(code: string, locale = "en"): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

// Only non-USD mappings are listed; everything else resolves to USD.
// ZAR covers the Common Monetary Area, where the rand is legal tender at par.
const EUROZONE = "AT BE CY EE FI FR DE GR IE IT LV LT LU MT NL PT SK SI ES HR MC SM VA AD GF GP MQ RE".split(" ");

const MAP: Record<string, string> = {
  ...Object.fromEntries(EUROZONE.map((c) => [c, "EUR"])),
  ZA: "ZAR", NA: "ZAR", LS: "ZAR", SZ: "ZAR",
  GB: "GBP", GG: "GBP", JE: "GBP", IM: "GBP",
  CA: "CAD", AU: "AUD", NZ: "NZD",
  CH: "CHF", LI: "CHF",
  SG: "SGD", HK: "HKD", JP: "JPY", TW: "TWD",
  SE: "SEK", NO: "NOK",
  DK: "DKK", GL: "DKK", FO: "DKK",
  PL: "PLN", CZ: "CZK", HU: "HUF",
  IL: "ILS", MY: "MYR", TH: "THB", PH: "PHP", MX: "MXN",
};

/**
 * Display currency for a visitor's country. `enabled` is the set of currency
 * codes actually switched on in the admin, so turning one off immediately falls
 * those countries back to USD without a code change.
 */
export function currencyForCountry(cc: string | null | undefined, enabled?: Set<string>): string {
  const code = MAP[(cc ?? "").toUpperCase()] ?? "USD";
  if (enabled && !enabled.has(code)) return "USD";
  return code;
}

/** Countries that use a given currency. Used by the admin pricing views. */
export function countriesUsing(currency: string): string[] {
  if (currency === "USD") return COUNTRIES.filter((c) => !MAP[c]);
  return Object.entries(MAP).filter(([, v]) => v === currency).map(([k]) => k);
}

export interface RoundRule {
  decimals: number;
  round_to: number;    // round UP to a multiple of this
  round_minus: number; // then subtract this
}

/**
 * Turn a raw converted amount into a shelf price.
 * 34.21 USD -> 34.99;  612.40 ZAR -> 619;  4831 JPY -> 4900.
 * Never returns less than the raw amount minus one rounding step, so rounding
 * can't quietly eat the margin buffer.
 */
export function roundPrice(amount: number, rule: RoundRule): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const step = rule.round_to > 0 ? rule.round_to : 1;
  const up = Math.ceil(amount / step) * step;
  const charmed = Math.max(0, up - rule.round_minus);
  // If subtracting the charm amount dropped us below the true converted price,
  // go up one more step rather than sell under.
  const final = charmed < amount ? Math.max(0, up + step - rule.round_minus) : charmed;
  return Number(final.toFixed(rule.decimals));
}

/** Format for display. Symbols come from the currencies table, not hardcoded. */
export function formatPrice(amount: number, symbol: string, decimals: number): string {
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/** Static symbol map mirroring the `currencies` table, for code paths that
 *  cannot await a DB read (client components, formatters, admin tables).
 *  The table stays the source of truth for pricing; this is for DISPLAY only. */
export const SYMBOLS: Record<string, string> = {
  USD: "$", ZAR: "R", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", NZD: "NZ$",
  CHF: "CHF ", SGD: "S$", HKD: "HK$", SEK: "kr ", NOK: "kr ", DKK: "kr ",
  PLN: "zł ", CZK: "Kč ", ILS: "₪", MYR: "RM", THB: "฿", PHP: "₱", MXN: "Mex$",
  JPY: "¥", HUF: "Ft ", TWD: "NT$", BRL: "R$", CNY: "¥", RUB: "₽",
};

/** Zero-decimal currencies: showing "¥4,800.00" marks you out as broken. */
export const ZERO_DECIMAL = new Set(["JPY", "HUF", "TWD"]);

/** Symbol for a currency code. Falls back to the code itself, which is honest,
 *  rather than a dollar sign, which is wrong. */
export function symbolFor(code?: string | null): string {
  if (!code) return "";
  return SYMBOLS[code.toUpperCase()] ?? `${code.toUpperCase()} `;
}

/** Display an amount in any currency we support. */
export function money(amount: number | null | undefined, code?: string | null): string {
  const n = Number(amount ?? 0);
  const d = code && ZERO_DECIMAL.has(code.toUpperCase()) ? 0 : 2;
  return `${symbolFor(code)}${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}
