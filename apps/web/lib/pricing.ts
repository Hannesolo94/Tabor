// The one place a price is decided.
//
// Order of resolution for any SKU in any currency:
//   1. a manual override in product_prices  (authoritative, never touched by FX)
//   2. otherwise: base_price (USD) x FX rate x margin buffer, then rounded
//
// ZA is expected to live entirely in (1), because South African POD cost is not
// a conversion of the US cost. The rest of the world lives in (2).
//
// Two concepts that are easy to conflate and must not be:
//   CURRENCY          what the buyer sees and pays        (from their country)
//   FULFILMENT REGION who makes and ships it, so what it costs us (see region.ts)
// Namibia is ZAR but ships from SA; Australia is AUD but ships from Printful.
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { currencyForCountry, roundPrice, type RoundRule } from "./currency";

export const CURRENCY_COOKIE = "tabor_currency";
export const DEFAULT_CURRENCY = "USD";

/** Margin buffer (%) applied to FX-derived prices to absorb drift between daily
 *  refreshes. Overridable in app_settings 'pricing'. */
export const DEFAULT_FX_BUFFER = 3;

export interface CurrencyConfig extends RoundRule {
  code: string;
  symbol: string;
  gateway: string;
  enabled: boolean;
}

export interface PriceContext {
  currency: string;
  symbol: string;
  decimals: number;
  gateway: string;
  rate: number;                    // units per 1 USD
  rule: RoundRule;
  bufferPct: number;
  overrides: Record<string, number>; // sku -> manual price in this currency
  fxFetchedAt: string | null;
  fxStale: boolean;
}

function anon() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}

/** All currencies the store is configured for. Cached per request. */
export const getCurrencies = cache(async (): Promise<CurrencyConfig[]> => {
  const { data } = await anon().from("currencies").select("*").order("sort");
  return (data ?? []).map((c) => ({
    code: c.code as string,
    symbol: c.symbol as string,
    decimals: Number(c.decimals),
    round_to: Number(c.round_to),
    round_minus: Number(c.round_minus),
    gateway: c.gateway as string,
    enabled: !!c.enabled,
  }));
});

export const getEnabledCurrencyCodes = cache(async (): Promise<Set<string>> => {
  return new Set((await getCurrencies()).filter((c) => c.enabled).map((c) => c.code));
});

/**
 * Build everything needed to price the catalogue in one currency.
 * Falls back to USD if the requested currency is unknown, disabled, or has no
 * FX rate, so a misconfiguration downgrades gracefully instead of showing zeros.
 */
export const getPriceContext = cache(async (requested: string): Promise<PriceContext> => {
  const sb = anon();
  const currencies = await getCurrencies();

  let cfg = currencies.find((c) => c.code === requested && c.enabled);
  if (!cfg) cfg = currencies.find((c) => c.code === DEFAULT_CURRENCY)!;

  const [{ data: fx }, { data: overrideRows }, { data: settings }] = await Promise.all([
    sb.from("fx_rates").select("rate_per_usd, fetched_at").eq("currency", cfg.code).maybeSingle(),
    sb.from("product_prices").select("sku, price").eq("currency", cfg.code),
    sb.from("app_settings").select("value").eq("key", "pricing").maybeSingle(),
  ]);

  const rate = cfg.code === "USD" ? 1 : Number(fx?.rate_per_usd ?? 0);
  const bufferPct = Number((settings?.value as { fx_buffer_pct?: number } | null)?.fx_buffer_pct ?? DEFAULT_FX_BUFFER);

  // No usable rate for a non-USD currency: fall back rather than price at zero.
  if (!(rate > 0)) {
    const usd = currencies.find((c) => c.code === DEFAULT_CURRENCY)!;
    const { data: usdOverrides } = await sb.from("product_prices").select("sku, price").eq("currency", "USD");
    return {
      currency: usd.code, symbol: usd.symbol, decimals: usd.decimals, gateway: usd.gateway,
      rate: 1, rule: usd, bufferPct,
      overrides: Object.fromEntries((usdOverrides ?? []).map((o) => [o.sku as string, Number(o.price)])),
      fxFetchedAt: null, fxStale: true,
    };
  }

  const fetchedAt = (fx?.fetched_at as string | undefined) ?? null;
  return {
    currency: cfg.code,
    symbol: cfg.symbol,
    decimals: cfg.decimals,
    gateway: cfg.gateway,
    rate,
    rule: cfg,
    bufferPct,
    overrides: Object.fromEntries((overrideRows ?? []).map((o) => [o.sku as string, Number(o.price)])),
    fxFetchedAt: fetchedAt,
    fxStale: !fetchedAt || Date.now() - new Date(fetchedAt).getTime() > 36 * 60 * 60 * 1000,
  };
});

/** Resolve one SKU's shelf price. `baseUsd` is products.base_price. */
export function priceFor(sku: string, baseUsd: number | null | undefined, ctx: PriceContext): number {
  const override = ctx.overrides[sku];
  if (Number.isFinite(override) && override > 0) return Number(override);

  const base = Number(baseUsd ?? 0);
  if (!(base > 0)) return 0;
  // USD IS the authored shelf price. Never re-round it, or a $90 blanket that
  // was priced deliberately becomes $89.99 on its own.
  if (ctx.currency === "USD") return Number(base.toFixed(ctx.decimals));

  return roundPrice(base * ctx.rate * (1 + ctx.bufferPct / 100), ctx.rule);
}

/** Convert a USD amount (shipping, thresholds) into the context currency. */
export function usdToContext(usd: number, ctx: PriceContext): number {
  if (ctx.currency === "USD") return Number(usd.toFixed(2));
  return roundPrice(usd * ctx.rate * (1 + ctx.bufferPct / 100), ctx.rule);
}

/** True if this SKU's price in this currency was set by hand. */
export function isManualPrice(sku: string, ctx: PriceContext): boolean {
  const o = ctx.overrides[sku];
  return Number.isFinite(o) && o > 0;
}

/** Currency for a visitor country, restricted to what's switched on. */
export async function currencyForVisitorCountry(cc: string | null | undefined): Promise<string> {
  return currencyForCountry(cc, await getEnabledCurrencyCodes());
}

/**
 * The visitor's display currency: the cookie middleware set from edge geo, or
 * the switcher's choice. Validated against enabled currencies on every read, so
 * turning a currency off in the admin takes effect immediately even for people
 * already carrying its cookie.
 */
export async function getCurrency(): Promise<string> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const picked = jar.get(CURRENCY_COOKIE)?.value?.toUpperCase();
  if (picked && (await getEnabledCurrencyCodes()).has(picked)) return picked;

  // Legacy cookie from the two-region era.
  if (jar.get("tabor_region")?.value === "ZA" && (await getEnabledCurrencyCodes()).has("ZAR")) return "ZAR";
  return DEFAULT_CURRENCY;
}

/** Price context for the current visitor. The storefront's usual entry point. */
export async function getVisitorPriceContext(): Promise<PriceContext> {
  return getPriceContext(await getCurrency());
}
