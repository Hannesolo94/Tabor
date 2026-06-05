-- Product media gallery: many images/videos per product, ordered, show/hide,
-- from Printful or uploaded. Files live in a public Supabase Storage bucket.

create table if not exists public.product_media (
  id         uuid primary key default gen_random_uuid(),
  sku        text not null references public.products (sku) on delete cascade,
  type       text not null default 'image' check (type in ('image', 'video')),
  url        text not null,
  alt        text,
  source     text not null default 'upload' check (source in ('upload', 'printful')),
  sort       int not null default 0,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists product_media_sku_idx on public.product_media (sku, sort);

alter table public.product_media enable row level security;

-- storefront reads visible media (anon); admins manage all
drop policy if exists product_media_read on public.product_media;
create policy product_media_read on public.product_media for select using (true);
drop policy if exists product_media_admin on public.product_media;
create policy product_media_admin on public.product_media for all
  using (public.is_admin()) with check (public.is_admin());

-- ── storage bucket for uploads (public read) ──
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

-- storage policies: public read, admin write/update/delete on this bucket
drop policy if exists "product-media read" on storage.objects;
create policy "product-media read" on storage.objects
  for select using (bucket_id = 'product-media');

drop policy if exists "product-media insert" on storage.objects;
create policy "product-media insert" on storage.objects
  for insert with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "product-media update" on storage.objects;
create policy "product-media update" on storage.objects
  for update using (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "product-media delete" on storage.objects;
create policy "product-media delete" on storage.objects
  for delete using (bucket_id = 'product-media' and public.is_admin());
