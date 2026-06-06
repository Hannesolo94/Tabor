# Backend Roadmap — "What to Add Next"

Synthesized from 2026 research on Shopify (admin + Magic/Sidekick), BigCommerce,
Medusa, Vendure, Saleor, WooCommerce, mapped to TABOR's custom Next.js + Supabase
admin. Ordered by value-for-effort. Checkout being live is the key gating factor.

## Build now (no checkout dependency)
| Priority | Feature | Why | Effort |
|---|---|---|---|
| 1 | **SEO: meta + sitemap + redirects** | cheap organic traffic; protects link equity as POD SKUs rotate | Low ✅ *(foundation shipped — see below)* |
| 2 | **Staff accounts + roles/permissions** | team + POD ops; least-privilege (RLS-backed) | Low–Med |
| 3 | **Audit log** | trust/compliance; pairs with POPIA deletes | Low |
| 4 | **Customer segments + tags** | powers every marketing/discount action (e.g. "SA repeat buyers", "lapsed 90d") | Med |
| 5 | **Cohort/retention + per-product analytics + report export** | the layer our snapshot dashboard lacks | Med |
| 6 | **Blog / nav-menu builder / FAQ** | faith-content SEO synergy; crawlable nav | Low–Med |
| 7 | **Order timeline / activity feed** | foundation for all order ops (build the shell now) | Low |
| 8 | **Webhooks (outbound) + broader CSV import/export** | integrations + bulk ops | Med |
| 9 | **Backups** — Supabase PITR + periodic logical export | insurance, esp. before POPIA deletes | Low |

## Build WITH checkout
- **Returns / RMA + refunds + partial fulfilment** (#1 ops gap — POD sizing returns are inevitable)
- **Abandoned-cart / checkout recovery** (direct revenue back)
- **Store credit + gift cards** (issue credit on returns instead of cash — better retention)
- **Multi-currency display + VAT/tax engine** (SA 15% VAT + destination tax)
- **Fraud risk flags + draft orders** (protect margin; manual/comp/wholesale orders)
- **Inventory reservations** (prevent oversell)

## Defer / integrate later
Loyalty/points, referrals, wholesale/B2B price lists. (Most stores integrate these
rather than build them; revisit once there's a customer base + checkout.)

## AI assistant — close the gap to Shopify Sidekick (2026)
We already have Claude tool-use over store data. Next upgrades:
1. **Multi-step "do it for me" with approval** — give the assistant WRITE tools (create
   discount, create segment, edit content) gated behind an explicit confirm step.
2. **Proactive alerts ("Pulse")** — scheduled jobs that surface "Crusader tee sell-through
   up 40%, restock", "conversion dropped", into a notifications feed. Pairs with an automation engine.
3. **Brand-voice lock** — hard-wire the System voice (terse, `[STATUS]`, no em dashes/emoji)
   so AI-drafted copy/emails/announcements ship on-brand.
4. **Product enrichment** — one-click "enrich" on the product editor: draft description,
   suggest tags, fill SEO meta.
5. **Conversational analytics** — answer "best sellers in SA last month?" with tables/charts
   (extends current get_metrics to cohort/region drilldowns).

## Already built (don't rebuild)
Dashboard (full metrics + custom ranges + region split), Products (CRUD + media/video +
Printful import + bulk + sizes + cost + SA/intl pricing + search), Reviews (moderation/UGC/CSV),
Customers (CRM + notes + POPIA delete + CSV + email sync + search), Content/hero + announcement
bar, Discounts, Orders (list/detail/status), Marketing (pixels + conversion + email), Suppliers,
Settings, global search, AI assistant, first-party analytics, geo-pricing, legal pages, a11y.

> Full sourced research is in the session history (Shopify/Medusa/Vendure/BigCommerce, mid-2026).
