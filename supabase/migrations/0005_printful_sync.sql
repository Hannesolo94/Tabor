-- Support importing products from Printful. printful_id already exists; store the
-- per-variant sync mapping (size/color -> sync_variant_id) needed for order
-- submission, plus a marker of which supplier a product came from.

alter table public.products
  add column if not exists printful_variants jsonb not null default '[]'::jsonb,
  add column if not exists source            text not null default 'manual';  -- 'manual' | 'printful'

create index if not exists products_source_idx on public.products (source);
