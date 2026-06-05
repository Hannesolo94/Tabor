-- Rotating top announcement bar. Each row is one "cycle" the bar rotates
-- through. Fully styleable per cycle (colors, background image, font). Public
-- reads enabled cycles; admin manages all.

create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  text         text not null,
  link         text,
  bg_color     text not null default '#0C0C10',
  text_color   text not null default '#C9A961',
  bg_image_url text,
  font         text not null default 'mono',   -- mono | cinzel | inter | pirata | cormorant
  sort         int not null default 0,
  enabled      boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists announcements_sort_idx on public.announcements (sort);

alter table public.announcements enable row level security;
drop policy if exists announcements_read on public.announcements;
create policy announcements_read on public.announcements for select using (true);
drop policy if exists announcements_admin on public.announcements;
create policy announcements_admin on public.announcements for all
  using (public.is_admin()) with check (public.is_admin());

insert into public.announcements (text, sort) values
  ('FREE BROTHERHOOD APP · SONS OF FIRE', 0),
  ('10% OFF YOUR FIRST ORDER · CODE FIRE10', 1),
  ('PRINTED ON DEMAND · SHIPS WORLDWIDE', 2)
on conflict do nothing;
