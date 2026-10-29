-- Public catalog read, tightened (Oct 29 2026 security pass, Hannes: "crawlers and bots can only see what's on the
-- front end").
--
-- Before: products_read was `using (true)` and anon had table-wide SELECT, so the public anon key in the page source
-- could read every product row, drafts included, and the `cost` column (what Printful charges us, so our margins).
--
-- After:
--   * rows: anyone sees LIVE products; admins see everything (the admin pages run as an authenticated admin).
--   * columns: anon gets every column the storefront reads, but not `cost` or `price_za`. Logged-in admins keep full
--     column access because the admin editor selects `*`. The service role (server routes) is unaffected.

drop policy if exists products_read on public.products;
create policy products_read on public.products for select
  using (status = 'live' or is_admin());

revoke select on public.products from anon;
grant select (sku, printful_id, name, collection, note, image_url, status, sort, created_at, category, description,
              phase, featured, base_price, tagline, blurb, tone, ink, mark, sizes, inventory, track_inventory,
              printful_variants, source)
  on public.products to anon;
