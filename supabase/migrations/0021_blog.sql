-- Blog / content CMS. Faith + brand content for SEO and the community.
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  body         text not null default '',
  cover_image  text,
  author       text default 'TABOR',
  status       text not null default 'draft', -- draft | published
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists posts_status_idx on public.posts (status, published_at desc);

alter table public.posts enable row level security;
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select using (status = 'published');
drop policy if exists posts_admin on public.posts;
create policy posts_admin on public.posts for all using (public.is_admin()) with check (public.is_admin());
