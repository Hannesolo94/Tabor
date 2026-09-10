-- Settlement: what the buyer was SHOWN vs what we actually CHARGED.
--
-- Yoco settles exclusively in ZAR. A German buyer browses in EUR and agrees to
-- a EUR total, but the card is charged in rand. The order has to record both,
-- or we cannot reconcile a Yoco payout, refund the exact amount captured after
-- the rate has moved, or report revenue honestly.
--
-- Existing columns (currency, total) stay as THE AGREEMENT: what they saw.
-- These new columns are THE SETTLEMENT: what the gateway actually moved.

alter table public.orders
  add column if not exists settlement_currency text,
  add column if not exists settlement_amount numeric,
  add column if not exists settlement_rate numeric;

comment on column public.orders.settlement_currency is
  'Currency actually charged by the gateway. ZAR for Yoco, always.';
comment on column public.orders.settlement_amount is
  'Amount actually charged, in settlement_currency. Refunds must use THIS, not total.';
comment on column public.orders.settlement_rate is
  'settlement_amount / total at capture time. Frozen so reporting never drifts.';

-- Yoco returns a payment id on the webhook but no checkout id, so the order id
-- travels in checkout metadata and comes back that way. Keep the gateway's own
-- ids for reconciliation against a payout statement.
alter table public.orders
  add column if not exists gateway_checkout_id text,
  add column if not exists gateway_payment_id text;

create index if not exists orders_gateway_payment_idx on public.orders (gateway_payment_id);
create index if not exists orders_gateway_checkout_idx on public.orders (gateway_checkout_id);

-- Webhooks can be redelivered. Recording every event id we have already applied
-- makes replay a no-op rather than a double-marked order.
create table if not exists public.payment_events (
  id text primary key,                 -- the gateway's own event id
  provider text not null,
  type text not null,
  order_id uuid references public.orders(id) on delete set null,
  payload jsonb,
  received_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;
-- service role only: this is payment plumbing, not user data
revoke all on public.payment_events from anon, authenticated;
