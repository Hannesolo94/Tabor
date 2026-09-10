// FX rates: pulled once a day, cached in the DB, never called per request.
//
// Two free, keyless sources. open.er-api.com is primary (covers all 166
// currencies we might want); ECB via frankfurter is the cross-check. If they
// disagree by more than DRIFT_TOLERANCE the feed is suspect, so we keep the last
// known good rate rather than repricing the catalogue off bad data.
//
// Storefront reads NEVER hit the network: getRates() reads the table, and if the
// table is stale or empty it still returns what it has. A pricing page must not
// fail because a rate API is down.
import { supabaseAdmin } from "@/lib/supabase/admin";

const PRIMARY = "https://open.er-api.com/v6/latest/USD";
const CROSS = "https://api.frankfurter.dev/v1/latest?base=USD";
const DRIFT_TOLERANCE = 0.02; // 2%

export type Rates = Record<string, number>; // currency -> units per 1 USD

async function fetchJson(url: string, ms = 8000): Promise<Record<string, unknown> | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    const res = await fetch(url, { signal: ctl.signal, cache: "no-store" });
    clearTimeout(t);
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export interface RefreshReport {
  ok: boolean;
  updated: number;
  skipped: { currency: string; reason: string }[];
  source: string;
  date?: string;
  error?: string;
}

/** Pull fresh rates and store them. Called by cron and by the admin refresh button. */
export async function refreshRates(): Promise<RefreshReport> {
  const sb = supabaseAdmin();
  const { data: currencies } = await sb.from("currencies").select("code").neq("code", "USD");
  const wanted = (currencies ?? []).map((c) => c.code as string);

  const primary = await fetchJson(PRIMARY);
  const rates = (primary?.rates ?? null) as Rates | null;
  if (!rates) return { ok: false, updated: 0, skipped: [], source: PRIMARY, error: "primary FX source unavailable" };

  const cross = ((await fetchJson(CROSS))?.rates ?? {}) as Rates;
  const skipped: { currency: string; reason: string }[] = [];
  const rows: { currency: string; rate_per_usd: number; source: string; cross_check: number | null; fetched_at: string }[] = [];
  const now = new Date().toISOString();

  for (const code of wanted) {
    const rate = Number(rates[code]);
    if (!Number.isFinite(rate) || rate <= 0) {
      skipped.push({ currency: code, reason: "not quoted by the source" });
      continue;
    }
    const check = Number(cross[code]);
    if (Number.isFinite(check) && check > 0) {
      const drift = Math.abs(rate - check) / check;
      if (drift > DRIFT_TOLERANCE) {
        skipped.push({ currency: code, reason: `sources disagree by ${(drift * 100).toFixed(1)}%, keeping last known rate` });
        continue;
      }
    }
    rows.push({ currency: code, rate_per_usd: rate, source: "open.er-api.com", cross_check: Number.isFinite(check) ? check : null, fetched_at: now });
  }

  // USD is the base and always exactly 1.
  rows.push({ currency: "USD", rate_per_usd: 1, source: "base", cross_check: 1, fetched_at: now });

  const { error } = await sb.from("fx_rates").upsert(rows, { onConflict: "currency" });
  if (error) return { ok: false, updated: 0, skipped, source: PRIMARY, error: error.message };

  return { ok: true, updated: rows.length, skipped, source: "open.er-api.com", date: String(primary?.time_last_update_utc ?? "") };
}

/** Cached rates from the DB. Safe to call on every render. */
export async function getRates(): Promise<{ rates: Rates; fetchedAt: string | null; stale: boolean }> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("fx_rates").select("currency, rate_per_usd, fetched_at");
  const rates: Rates = { USD: 1 };
  let newest: string | null = null;
  for (const r of data ?? []) {
    rates[r.currency as string] = Number(r.rate_per_usd);
    const at = r.fetched_at as string;
    if (!newest || at > newest) newest = at;
  }
  const stale = !newest || Date.now() - new Date(newest).getTime() > 36 * 60 * 60 * 1000;
  return { rates, fetchedAt: newest, stale };
}

/**
 * Convert a USD amount into `currency`, applying the margin buffer that absorbs
 * FX drift between daily refreshes. Rounding is applied by the caller, which
 * holds the per-currency rule.
 */
export function convertFromUsd(usd: number, currency: string, rates: Rates, bufferPct = 0): number | null {
  const rate = rates[currency];
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return usd * rate * (1 + bufferPct / 100);
}
