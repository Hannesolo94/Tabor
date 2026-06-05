-- Customer reviews (in-house, no third-party tool). Per-product, with optional
-- photo/video UGC. Public can submit (forced to 'pending') and read 'approved';
-- admin moderates everything.

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  sku        text references public.products (sku) on delete set null,
  name       text not null,
  email      text,
  rating     int not null check (rating between 1 and 5),
  title      text,
  body       text not null,
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  consent    boolean not null default false,  -- agreed media may be used for marketing
  created_at timestamptz not null default now()
);
create index if not exists reviews_sku_idx on public.reviews (sku, status);

create table if not exists public.review_media (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews (id) on delete cascade,
  type       text not null default 'image' check (type in ('image', 'video')),
  url        text not null,
  created_at timestamptz not null default now()
);
create index if not exists review_media_review_idx on public.review_media (review_id);

alter table public.reviews enable row level security;
alter table public.review_media enable row level security;

-- reviews: public reads approved, public submits as pending, admin all
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (status = 'approved');
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert with check (status = 'pending');
drop policy if exists reviews_admin on public.reviews;
create policy reviews_admin on public.reviews for all using (public.is_admin()) with check (public.is_admin());

-- review media: public reads + inserts (gated in practice by review moderation), admin all
drop policy if exists review_media_read on public.review_media;
create policy review_media_read on public.review_media for select using (true);
drop policy if exists review_media_insert on public.review_media;
create policy review_media_insert on public.review_media for insert with check (true);
drop policy if exists review_media_admin on public.review_media;
create policy review_media_admin on public.review_media for all using (public.is_admin()) with check (public.is_admin());

-- storage bucket for customer-uploaded review media (public read; open insert,
-- bounded by moderation + later rate-limiting)
insert into storage.buckets (id, name, public) values ('review-media', 'review-media', true)
on conflict (id) do nothing;
drop policy if exists "review-media read" on storage.objects;
create policy "review-media read" on storage.objects for select using (bucket_id = 'review-media');
drop policy if exists "review-media insert" on storage.objects;
create policy "review-media insert" on storage.objects for insert with check (bucket_id = 'review-media');
drop policy if exists "review-media admin" on storage.objects;
create policy "review-media admin" on storage.objects for delete using (bucket_id = 'review-media' and public.is_admin());

-- two sample approved reviews for showcasing
insert into public.reviews (sku, name, rating, title, body, status, consent) values
  ('snt-tee-sof', 'Marcus T.', 5, 'Built like armour', 'Heaviest tee I own. The wordmark on the back gets comments every time. Wear it to train and to church.', 'approved', true),
  ('crs-hoodie-ascent', 'Daniel R.', 5, 'My everyday now', 'The Ascent hoodie is exactly what I wanted. Tonal seal is subtle, fleece is thick. Iron sharpens iron.', 'approved', true)
on conflict do nothing;
