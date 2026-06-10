-- Bundles: curated product packs sold at a discount (AOV driver). Works like
-- collections (a bundle has N member products picked from the catalog) plus a
-- discount_percent applied to the sum of member prices (region-safe: shows the
-- same % off in USD and ZAR). Bundles are not eligible for promo/discount codes.
create table if not exists public.bundles (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  description      text,
  discount_percent numeric not null default 0,   -- % off the sum of member prices
  image_url        text,                          -- card image; falls back to first member's image
  visible          boolean not null default false,
  sort             int not null default 0,
  created_at       timestamptz not null default now()
);
create table if not exists public.bundle_products (
  bundle_id uuid not null references public.bundles (id) on delete cascade,
  sku       text not null references public.products (sku) on delete cascade,
  sort      int not null default 0,
  primary key (bundle_id, sku)
);
alter table public.bundles enable row level security;
alter table public.bundle_products enable row level security;
drop policy if exists bundles_read on public.bundles;
create policy bundles_read on public.bundles for select using (visible = true);
drop policy if exists bundles_admin on public.bundles;
create policy bundles_admin on public.bundles for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists bundle_products_read on public.bundle_products;
create policy bundle_products_read on public.bundle_products for select using (true);
drop policy if exists bundle_products_admin on public.bundle_products;
create policy bundle_products_admin on public.bundle_products for all using (public.is_admin()) with check (public.is_admin());
