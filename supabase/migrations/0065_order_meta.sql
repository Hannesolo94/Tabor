-- Order notes + tags for the detail right-rail (Shopify-style).
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists tags text[] not null default '{}';
