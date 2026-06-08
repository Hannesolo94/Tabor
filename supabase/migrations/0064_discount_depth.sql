-- Deepen discount_codes toward a Shopify-style discount (value type, min spend, dates, tags).
alter table public.discount_codes add column if not exists value_type text not null default 'percentage'; -- 'percentage' | 'fixed'
alter table public.discount_codes add column if not exists amount numeric;        -- fixed $ off (when value_type='fixed')
alter table public.discount_codes add column if not exists min_subtotal numeric;  -- minimum purchase $
alter table public.discount_codes add column if not exists starts_at timestamptz;
alter table public.discount_codes add column if not exists ends_at timestamptz;
alter table public.discount_codes add column if not exists tags text[] not null default '{}';
