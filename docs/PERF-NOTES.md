# Performance Notes & Plan

Status of the "deferred perf polish" items. Some are done; the risky infra ones are
documented with a recommended approach rather than changed unsupervised on the live site.

## Done
- **Hot-path indexes** (migration `0015`): `products(status, sort)`, `products(printful_id)`,
  `orders(user_id|status|created_at)`, `profiles(email)`, plus the analytics indexes
  (`analytics_events(created_at)`, `(type, created_at)`, `(session_id)`). The dashboard and
  storefront queries hit indexes, not full scans.
- **Bounded analytics queries** — every dashboard query is date-range filtered (`gte/lt`).

## ISR caching — intentionally NOT applied (with reason)
The storefront shows **region-specific prices** (ZAR vs USD) driven by the `tabor_region`
**cookie**. Next.js full-route ISR caches per-URL, **not per-cookie**, so caching a product
page would serve one region's prices to everyone. That's why the storefront is `force-dynamic`.
**Correctness beats caching here.** Future options if perf demands it:
1. Render prices **region-agnostic** server-side and localize on the client (lets pages cache).
2. Use the Supabase anon client with a short in-memory cache for the catalog (per server instance).
3. Vercel Data Cache + `revalidateTag('products')` on admin writes, keyed so region is a param not a cookie.
Until traffic is real, `force-dynamic` is fine and simplest.

## Dashboard SQL aggregation — recommended, not yet done
Today `getDashboard` pulls range rows (events + orders) into JS and aggregates. Correct and
fast at current volume (≈0 rows), but it will degrade once orders/traffic scale. **Recommended
upgrade:** move aggregation into Postgres with `RPC` functions / materialized views, e.g.
`analytics_daily(from,to)` returning daily revenue/orders/distinct-sessions, and an
`analytics_summary(from,to)` for totals + top-N. Keeps payloads tiny and pushes work to the DB.
Deferred because it's a non-trivial refactor best done with eyes on it; no urgency pre-launch.
Note: the all-time `allOrders` LTV query is currently unbounded — convert to a SQL aggregate
when doing this.

## Rate limiting — recommended approach
Public POSTs (`/api/track`, `/api/subscribe`, `/api/review`) currently have a **same-origin
check** (blocks casual cross-site abuse) but no rate limit. Serverless in-memory limiting is
unreliable (per-instance). **Recommended:** add **Upstash Redis** (`@upstash/ratelimit`, free
tier) for per-IP sliding-window limits, or a Supabase-table counter for low volume. Add before
running paid ad traffic. Not built yet (needs the Upstash account + key).

## Other
- Images use plain `<img>` (Printful/UGC are remote). Fine for now; consider `next/image` with
  remote patterns for hero/product LCP later, and `loading="lazy"` below the fold.
- `getSuggestions` refetches the full catalog per PDP — trivial at this catalog size; revisit
  with a dedicated query if the catalog grows large.
