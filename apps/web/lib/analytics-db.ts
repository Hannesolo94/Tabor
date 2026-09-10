// Dashboard analytics. Sales metrics come from `orders` (populate once checkout
// is live); traffic/conversion come from `analytics_events` (collecting now).
import { supabaseAdmin } from "@/lib/supabase/admin";

export type RangeKey = "today" | "7d" | "30d" | "90d" | "custom";

export interface Series {
  labels: string[]; // YYYY-MM-DD per day
  revenue: number[];
  orders: number[];
  sessions: number[];
}

export interface Dashboard {
  rangeKey: RangeKey;
  fromLabel: string;
  toLabel: string;
  // sales
  revenue: number;
  orderCount: number;
  aov: number;
  cogs: number;
  margin: number;
  marginPct: number;
  ltv: number;
  repeatRate: number;
  // traffic
  pageviews: number;
  sessions: number;
  visitors: number;
  conversion: number;
  appClicks: number;
  // funnel
  funnel: { pageviews: number; addToCart: number; checkout: number; purchase: number };
  cartAbandon: number;
  series: Series;
  topProducts: { sku: string; name: string; qty: number; revenue: number }[];
  topCategories: { category: string; qty: number; revenue: number }[];
  sources: { source: string; count: number }[];
  lowStock: { sku: string; name: string; inventory: number }[];
  // revenue + orders split by region (alongside the overall totals above)
  regions: { region: string; revenue: number; orders: number }[];
  // period-over-period % change vs the previous equal window
  deltas: { revenue: number; orders: number; sessions: number; conversion: number; aov: number };
}

const DAY = 86400000;

// Cross-currency aggregates are normalised to USD. Two things this used to get
// wrong, both of which produced quietly false revenue:
//   1. a hardcoded ZAR_USD = 0.054 (R18.52/$) drifted to ~13% off the real rate
//   2. anything that was not ZAR was treated as ALREADY USD, so a EUR37.98 order
//      was counted as $37.98 rather than $44
// Orders now carry fx_rate_to_usd, frozen at purchase, so historical revenue
// cannot move when today's rate does. Only orders predating that column fall
// back to a live rate.
type FxMap = Record<string, number>; // currency -> units per 1 USD

async function liveRates(sb: ReturnType<typeof supabaseAdmin>): Promise<FxMap> {
  try {
    const { data } = await sb.from("fx_rates").select("currency, rate_per_usd");
    const out: FxMap = { USD: 1 };
    for (const r of (data ?? []) as { currency: string; rate_per_usd: number }[]) out[r.currency] = Number(r.rate_per_usd);
    return out;
  } catch {
    return { USD: 1 };
  }
}

interface MoneyRow { total?: unknown; currency?: string | null; fx_rate_to_usd?: unknown }

/** Convert one order's amount to USD, preferring the rate frozen on the order. */
function orderUsd(amount: number, row: MoneyRow, fx: FxMap): number {
  const cur = (row.currency ?? "USD").toUpperCase();
  if (cur === "USD") return amount;
  const frozen = Number(row.fx_rate_to_usd);
  if (Number.isFinite(frozen) && frozen > 0) return amount * frozen;
  const rate = fx[cur];
  if (Number.isFinite(rate) && rate > 0) return amount / rate;
  return amount; // unknown currency: better to count it than to drop it
}
function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}
function rangeBounds(key: RangeKey, custom?: { from?: string; to?: string }): { from: Date; to: Date; days: number } {
  const now = new Date();
  // custom range: explicit from/to (inclusive), capped at ~13 months
  if (key === "custom" && custom?.from && custom?.to) {
    const f = new Date(custom.from + "T00:00:00Z");
    const t = new Date(custom.to + "T00:00:00Z");
    const from = f <= t ? f : t;
    const to = f <= t ? t : f;
    const days = Math.min(400, Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY) + 1));
    return { from, to, days };
  }
  const days = key === "today" ? 1 : key === "7d" ? 7 : key === "30d" ? 30 : 90;
  const from = new Date(now.getTime() - (days - 1) * DAY);
  from.setUTCHours(0, 0, 0, 0);
  return { from, to: now, days };
}

interface OrderItem { sku?: string; qty?: number; quantity?: number; price?: number }

export async function getDashboard(rangeKey: RangeKey, custom?: { from?: string; to?: string }): Promise<Dashboard> {
  const sb = supabaseAdmin();
  // Fallback rates for orders placed before fx_rate_to_usd existed.
  const fx = await liveRates(sb);
  const { from, to, days } = rangeBounds(rangeKey, custom);
  const fromIso = from.toISOString();
  // include the whole `to` day
  const toIso = new Date(to.getTime() + DAY).toISOString();

  const [statsRes, ordersRes, allOrdersRes, productsRes] = await Promise.all([
    sb.rpc("dashboard_event_stats", { p_from: fromIso, p_to: toIso }), // aggregated in Postgres
    sb.from("orders").select("total, items, user_id, created_at, status, region, currency, fx_rate_to_usd").gte("created_at", fromIso).lt("created_at", toIso),
    sb.from("orders").select("total, user_id, email, currency, fx_rate_to_usd").limit(10000), // safety cap for all-time LTV

    sb.from("products").select("sku, name, category, cost, inventory, track_inventory"),
  ]);

  const stats = (statsRes.data ?? {}) as { pageviews?: number; add_to_cart?: number; begin_checkout?: number; app_click?: number; sessions?: number; visitors?: number; sessions_by_day?: { day: string; n: number }[]; sources?: { source: string; count: number }[] };
  const orders = (ordersRes.data ?? []).filter((o) => o.status !== "cancelled");
  const allOrders = allOrdersRes.data ?? [];
  const products = productsRes.data ?? [];
  const prodMap = new Map(products.map((p) => [p.sku, p]));

  // day buckets
  const labels: string[] = [];
  for (let i = 0; i < days; i++) labels.push(dayKey(new Date(from.getTime() + i * DAY)));
  const revByDay = new Map(labels.map((l) => [l, 0]));
  const ordByDay = new Map(labels.map((l) => [l, 0]));
  const sessByDay = new Map<string, number>(labels.map((l) => [l, 0]));
  for (const s of stats.sessions_by_day ?? []) if (sessByDay.has(s.day)) sessByDay.set(s.day, s.n);

  // sales
  let revenue = 0;
  let cogs = 0;
  const prodAgg = new Map<string, { qty: number; revenue: number }>();
  const catAgg = new Map<string, { qty: number; revenue: number }>();
  const regionAgg = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const day = dayKey(new Date(o.created_at));
    const cur = (o as { currency?: string }).currency;
    const totalUsd = orderUsd(Number(o.total) || 0, o as MoneyRow, fx); // normalised via the order's own frozen rate
    revenue += totalUsd;
    const reg = (o as { region?: string }).region || "INTL";
    const ra = regionAgg.get(reg) ?? { revenue: 0, orders: 0 };
    ra.revenue += Number(o.total) || 0; ra.orders += 1; regionAgg.set(reg, ra); // region stays NATIVE currency
    if (revByDay.has(day)) revByDay.set(day, revByDay.get(day)! + totalUsd);
    if (ordByDay.has(day)) ordByDay.set(day, ordByDay.get(day)! + 1);
    const items = (Array.isArray(o.items) ? o.items : []) as OrderItem[];
    for (const it of items) {
      const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
      const price = orderUsd(Number(it.price ?? 0) || 0, o as MoneyRow, fx); // line prices are in the order's currency
      const p = it.sku ? prodMap.get(it.sku) : undefined;
      cogs += (Number(p?.cost) || 0) * qty;
      if (it.sku) {
        const pa = prodAgg.get(it.sku) ?? { qty: 0, revenue: 0 };
        pa.qty += qty; pa.revenue += price * qty; prodAgg.set(it.sku, pa);
        const cat = p?.category ?? "other";
        const ca = catAgg.get(cat) ?? { qty: 0, revenue: 0 };
        ca.qty += qty; ca.revenue += price * qty; catAgg.set(cat, ca);
      }
    }
  }

  // traffic / funnel (aggregated in SQL via dashboard_event_stats)
  const pageviews = stats.pageviews ?? 0;
  const addToCart = stats.add_to_cart ?? 0;
  const checkout = stats.begin_checkout ?? 0;
  const appClicks = stats.app_click ?? 0;
  const sessionsCount = stats.sessions ?? 0;
  const visitorsCount = stats.visitors ?? 0;

  const orderCount = orders.length;
  const aov = orderCount ? revenue / orderCount : 0;
  const margin = revenue - cogs;
  const marginPct = revenue ? (margin / revenue) * 100 : 0;
  const conversion = sessionsCount ? (orderCount / sessionsCount) * 100 : 0;
  const cartAbandon = addToCart ? (1 - orderCount / addToCart) * 100 : 0;

  // LTV + repeat (all-time)
  const byCustomer = new Map<string, { spend: number; orders: number }>();
  for (const o of allOrders) {
    // key by account, else by email so distinct guests are distinct customers (not one "guest")
    const k = o.user_id || (o as { email?: string }).email || "guest";
    const c = byCustomer.get(k) ?? { spend: 0, orders: 0 };
    c.spend += orderUsd(Number(o.total) || 0, o as MoneyRow, fx); c.orders += 1; byCustomer.set(k, c);
  }
  const customers = [...byCustomer.values()];
  const ltv = customers.length ? customers.reduce((a, c) => a + c.spend, 0) / customers.length : 0;
  const repeatRate = customers.length ? (customers.filter((c) => c.orders > 1).length / customers.length) * 100 : 0;

  const topProducts = [...prodAgg.entries()]
    .map(([sku, v]) => ({ sku, name: prodMap.get(sku)?.name ?? sku, ...v }))
    .sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topCategories = [...catAgg.entries()].map(([category, v]) => ({ category, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const sources = (stats.sources ?? []).slice(0, 6);
  const lowStock = products.filter((p) => p.track_inventory && (p.inventory ?? 0) <= 3).map((p) => ({ sku: p.sku, name: p.name, inventory: p.inventory ?? 0 }));

  // previous equal-length window -> period-over-period deltas (Shopify-style)
  const prevFromIso = new Date(from.getTime() - days * DAY).toISOString();
  const [prevOrdersRes, prevStatsRes] = await Promise.all([
    sb.from("orders").select("total, status, currency, fx_rate_to_usd").gte("created_at", prevFromIso).lt("created_at", fromIso),
    sb.rpc("dashboard_event_stats", { p_from: prevFromIso, p_to: fromIso }),
  ]);
  const prevOrders = (prevOrdersRes.data ?? []).filter((o) => o.status !== "cancelled");
  const prevRevenue = prevOrders.reduce((a, o) => a + orderUsd(Number(o.total) || 0, o as MoneyRow, fx), 0);
  const prevOrderCount = prevOrders.length;
  const prevSessions = ((prevStatsRes.data ?? {}) as { sessions?: number }).sessions ?? 0;
  const prevConversion = prevSessions ? (prevOrderCount / prevSessions) * 100 : 0;
  const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0);
  const deltas = {
    revenue: pct(revenue, prevRevenue),
    orders: pct(orderCount, prevOrderCount),
    sessions: pct(sessionsCount, prevSessions),
    conversion: pct(conversion, prevConversion),
    aov: pct(aov, prevOrderCount ? prevRevenue / prevOrderCount : 0),
  };

  return {
    deltas,
    rangeKey,
    fromLabel: labels[0]!,
    toLabel: labels[labels.length - 1]!,
    revenue, orderCount, aov, cogs, margin, marginPct, ltv, repeatRate,
    pageviews, sessions: sessionsCount, visitors: visitorsCount, conversion, appClicks,
    funnel: { pageviews, addToCart, checkout, purchase: orderCount },
    cartAbandon,
    series: {
      labels,
      revenue: labels.map((l) => revByDay.get(l) ?? 0),
      orders: labels.map((l) => ordByDay.get(l) ?? 0),
      sessions: labels.map((l) => sessByDay.get(l) ?? 0),
    },
    topProducts, topCategories, sources, lowStock,
    regions: [...regionAgg.entries()].map(([region, v]) => ({ region, ...v })).sort((a, b) => b.revenue - a.revenue),
  };
}
