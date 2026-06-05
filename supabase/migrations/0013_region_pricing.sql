-- Region pricing. A separate (cheaper) South African price per product. The
-- storefront shows the visitor's region price; the FINAL price + supplier are
-- locked by the shipping address at checkout, so the lower SA price only applies
-- to SA/African delivery (no exploiting via VPN).

alter table public.products add column if not exists price_za numeric not null default 0;
