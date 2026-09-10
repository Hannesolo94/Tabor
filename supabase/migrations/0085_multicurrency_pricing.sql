-- Multi-currency pricing.
--
-- Model: ONE base price per product in USD (products.base_price). Every other
-- currency is DERIVED from it by the daily FX rate plus a rounding rule, unless
-- a manual override exists in product_prices. ZA is expected to be a manual
-- override everywhere, because local POD cost is not a conversion of US cost.
--
-- Rule we hold to: only ever DISPLAY a currency we can actually CHARGE in, so
-- the buyer's statement matches the price they saw. That means PayPal's
-- settlement currencies, plus ZAR through Paystack.

-- 1) Supported currencies + how to round them ------------------------------
create table if not exists public.currencies (
  code text primary key,                    -- ISO 4217
  symbol text not null,
  decimals smallint not null default 2,
  round_to numeric not null default 1,      -- round the converted amount UP to a multiple of this
  round_minus numeric not null default 0.01,-- then subtract this (charm pricing: 34.99, R549)
  gateway text not null default 'paypal',   -- who can actually settle it
  enabled boolean not null default true,
  note text,
  sort integer not null default 100
);

insert into public.currencies (code, symbol, decimals, round_to, round_minus, gateway, enabled, note, sort) values
  ('USD', '$',    2, 1,   0.01, 'paypal',   true,  'Base currency. All other prices derive from this.', 1),
  ('ZAR', 'R',    2, 10,  1,    'paystack', true,  'Settled by Paystack. Expect manual overrides, not FX.', 2),
  ('EUR', '€',    2, 1,   0.01, 'paypal',   true,  null, 10),
  ('GBP', '£',    2, 1,   0.01, 'paypal',   true,  null, 11),
  ('CAD', 'C$',   2, 1,   0.01, 'paypal',   true,  null, 12),
  ('AUD', 'A$',   2, 1,   0.01, 'paypal',   true,  null, 13),
  ('NZD', 'NZ$',  2, 1,   0.01, 'paypal',   true,  null, 14),
  ('CHF', 'CHF ', 2, 1,   0.05, 'paypal',   true,  null, 15),
  ('SGD', 'S$',   2, 1,   0.01, 'paypal',   true,  null, 16),
  ('HKD', 'HK$',  2, 10,  1,    'paypal',   true,  null, 17),
  ('SEK', 'kr ',  2, 10,  1,    'paypal',   true,  null, 18),
  ('NOK', 'kr ',  2, 10,  1,    'paypal',   true,  null, 19),
  ('DKK', 'kr ',  2, 10,  1,    'paypal',   true,  null, 20),
  ('PLN', 'zł ',  2, 10,  1,    'paypal',   true,  null, 21),
  ('CZK', 'Kč ',  2, 10,  1,    'paypal',   true,  null, 22),
  ('ILS', '₪',    2, 10,  1,    'paypal',   true,  null, 23),
  ('MYR', 'RM',   2, 1,   0.01, 'paypal',   true,  null, 24),
  ('THB', '฿',    2, 10,  1,    'paypal',   true,  null, 25),
  ('PHP', '₱',    2, 10,  1,    'paypal',   true,  null, 26),
  ('MXN', 'Mex$', 2, 10,  1,    'paypal',   true,  null, 27),
  ('JPY', '¥',    0, 100, 0,    'paypal',   true,  null, 28),
  ('HUF', 'Ft ',  0, 100, 0,    'paypal',   true,  null, 29),
  ('TWD', 'NT$',  0, 10,  0,    'paypal',   true,  null, 30),
  -- Off by default: PayPal lists these but each has a real-world catch.
  ('BRL', 'R$',   2, 1,   0.01, 'paypal',   false, 'PayPal BRL generally needs a local Brazilian entity.', 40),
  ('CNY', '¥',    2, 1,   0.01, 'paypal',   false, 'PayPal CNY is restricted to certain account types.', 41),
  ('RUB', '₽',    2, 10,  1,    'paypal',   false, 'PayPal no longer operates in Russia.', 42)
on conflict (code) do nothing;

alter table public.currencies enable row level security;
drop policy if exists currencies_public_read on public.currencies;
create policy currencies_public_read on public.currencies for select to anon, authenticated using (true);

-- 2) Daily FX rates --------------------------------------------------------
create table if not exists public.fx_rates (
  currency text primary key references public.currencies(code) on delete cascade,
  rate_per_usd numeric not null check (rate_per_usd > 0),  -- 1 USD = rate_per_usd <currency>
  source text not null,
  cross_check numeric,                 -- second source's rate, for drift detection
  fetched_at timestamptz not null default now()
);

alter table public.fx_rates enable row level security;
drop policy if exists fx_rates_public_read on public.fx_rates;
create policy fx_rates_public_read on public.fx_rates for select to anon, authenticated using (true);

-- 3) Manual price overrides (supersedes the empty, unused region-keyed table)
drop table if exists public.product_prices;
create table public.product_prices (
  sku text not null references public.products(sku) on delete cascade,
  currency text not null references public.currencies(code) on delete cascade,
  price numeric not null check (price >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key (sku, currency)
);

alter table public.product_prices enable row level security;
drop policy if exists product_prices_public_read on public.product_prices;
create policy product_prices_public_read on public.product_prices for select to anon, authenticated using (true);

-- 4) What we PAY, per SKU per supplier. Printful rows are written by the sync
--    (source='api'); the SA POD is hand-entered until a supplier with an API is
--    chosen, so the shape supports both.
create table if not exists public.supplier_costs (
  sku text not null references public.products(sku) on delete cascade,
  supplier text not null,                   -- 'printful' | 'sa_pod' | ...
  cost numeric not null check (cost >= 0),
  currency text not null default 'USD',
  ships_to text not null default 'INTL',    -- which fulfilment region this cost serves
  source text not null default 'manual',    -- 'api' | 'manual'
  updated_at timestamptz not null default now(),
  primary key (sku, supplier)
);

alter table public.supplier_costs enable row level security;
-- admin-only: cost data is not public
revoke all on public.supplier_costs from anon, authenticated;

-- 5) Freeze the FX rate ON the order, so historical reporting never shifts
--    when today's rate moves. Without this, last month's revenue changes daily.
alter table public.orders add column if not exists fx_rate_to_usd numeric;

comment on column public.orders.fx_rate_to_usd is
  'Rate used to convert this order''s currency to USD at purchase time. Reporting must use this, never a live rate.';

create index if not exists orders_currency_created_idx on public.orders (currency, created_at desc);
