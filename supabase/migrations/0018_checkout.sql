-- Checkout infrastructure (gateway-agnostic). Extend orders with the fields a
-- real checkout needs. Order rows are created server-side (service role) by the
-- /api/checkout route, so no public insert policy is added.

alter table public.orders
  add column if not exists email           text,
  add column if not exists shipping        jsonb not null default '{}'::jsonb,  -- name/line1/line2/city/province/postal/country
  add column if not exists subtotal        numeric not null default 0,
  add column if not exists discount_code   text,
  add column if not exists discount_amount numeric not null default 0,
  add column if not exists shipping_amount numeric not null default 0,
  add column if not exists payment_provider text,
  add column if not exists payment_ref      text;

create index if not exists orders_email_idx on public.orders (email);

-- order status lifecycle (text, not enforced as enum for flexibility):
--   pending_payment -> paid -> fulfilled -> shipped -> (refunded | cancelled)
