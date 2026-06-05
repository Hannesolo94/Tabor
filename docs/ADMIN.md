# Admin Dashboard & Data-Driven CMS

Goal: a custom "Shopify-like" admin for the owner — track sales and edit the site without code —
WITHOUT trying to rebuild all of Shopify. Build our slice: orders + analytics + form-based content/
product management on a data-driven site. Lives in the same Next.js app under `/admin`,
gated by an `admin` role in Supabase (RLS + a role check; never client-trusted).

## Principle: make the site data-driven
The marketing site and store should READ their content from the DB, so the admin can change things
live with no redeploy:
- **Products** (name, price per region, images, collection/persona, draft|live, sort order)
- **Collections** (the four personas + any future ones)
- **Page content** (hero headline/subcopy, marquee items, creed tenets, banners) in a `content` table
- **Giveaways** (current prize, nominees, close date)

## Admin areas
1. **Dashboard** — revenue, orders count, sales by region/supplier, top products, waitlist growth,
   active testers. Pull from `orders`, `waitlist`, and supplier fulfilment statuses.
2. **Orders** — list/detail, fulfilment status (synced from Printful / SA PoD), refunds/notes.
3. **Products** — CRUD; set per-region prices (price books), upload images (Supabase Storage),
   assign collection, toggle draft/live, drag-reorder. Map each to supplier variant IDs.
4. **Content** — edit hero/marquee/creed/banner copy and images via forms.
5. **Giveaways** — set monthly prize + nominees; view votes/winner.
6. **Community moderation** (later) — review reported guild messages, block/remove.

## Scope honesty (tell the user)
- **Form-based editing** (edit text, swap image, change price, reorder, toggle live) = easy, do this. ✅
- **True visual drag-and-drop page builder** (Shopify theme-editor style) = a large separate project.
  Do NOT build this early; form-based control covers ~90% of real needs.
- Optional richer content editing without building from scratch: **Payload CMS** (free, self-host,
  Next-native) or **Sanity**. Keep commerce/orders in Supabase regardless.

## Analytics
- Use **PostHog** (free tier) for funnels/behaviour rather than building analytics from scratch.
- Business metrics (revenue, AOV, by-region) come from the `orders` data in the admin dashboard.

## Extra tables (add to DATA-MODEL)
- `price_books(region pk, currency)` and per-variant region prices, e.g.
  `product_prices(sku, region, price, currency)` PK (sku, region).
- `suppliers(id, name, regions text[])` and `product_suppliers(sku, supplier_id, supplier_variant_id)`.
- `content(key pk, value jsonb)` for editable page copy/images.
- `profiles.role text` ('user' | 'admin') with RLS so only admins reach `/admin` and write content/products.
- extend `orders` with `supplier`, `region`, `currency`.
