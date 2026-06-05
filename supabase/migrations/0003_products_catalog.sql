-- Extend products for a multi-category catalog (apparel + gear), beyond the
-- persona-only collection axis. Category = product type; collection = brand line.

alter table public.products
  add column if not exists category    text,
  add column if not exists description  text,
  add column if not exists phase        int not null default 1,   -- 1 POD now, 2 bulk drop, 3 bespoke
  add column if not exists featured     boolean not null default false,
  add column if not exists base_price   numeric;                  -- display price; real price per region lives in product_prices

-- category is the product type (apparel, headwear, flag, rug, blanket, towel,
-- candle, sticker, drinkware, stationery, print, patch, accessory).
create index if not exists products_category_idx on public.products (category);
create index if not exists products_phase_idx on public.products (phase);

comment on column public.products.collection is 'brand persona line: sentinel | crusader | scribe | pilgrim';
comment on column public.products.category is 'product type: apparel | headwear | flag | rug | blanket | towel | candle | sticker | drinkware | stationery | print | patch | accessory';
