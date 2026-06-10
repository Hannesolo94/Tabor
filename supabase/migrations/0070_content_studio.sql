-- Content Studio: one composer -> app feed (heart) + email newsletter + website blog
-- + social (later). Two creation paths: build by hand, OR drop media + a brief and the
-- post gets drafted from it (mirrors the POD design->product pipeline).
alter table public.posts add column if not exists type text not null default 'static';   -- static|carousel|video|reel|gif|mixed
alter table public.posts add column if not exists targets jsonb not null default '{"blog":true}'::jsonb; -- {app,email,blog,social}
alter table public.posts add column if not exists brief text;            -- rough note for drafting from an upload
alter table public.posts add column if not exists email_sent_at timestamptz;
alter table public.posts add column if not exists email_recipients int;
alter table public.posts add column if not exists app_published_at timestamptz;

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  kind text not null default 'image',  -- image|video|gif
  url text not null,
  poster_url text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists post_media_post_idx on public.post_media(post_id, sort);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists post_comments_post_idx on public.post_comments(post_id, created_at desc);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  kind text not null default 'amen',   -- amen|fire|strength|pray
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_media enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_reactions enable row level security;

drop policy if exists post_media_read on public.post_media;
create policy post_media_read on public.post_media for select using (true);
drop policy if exists post_media_admin on public.post_media;
create policy post_media_admin on public.post_media for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists post_comments_read on public.post_comments;
create policy post_comments_read on public.post_comments for select using (true);
drop policy if exists post_comments_insert on public.post_comments;
create policy post_comments_insert on public.post_comments for insert with check (auth.uid() = user_id);
drop policy if exists post_comments_del on public.post_comments;
create policy post_comments_del on public.post_comments for delete using (auth.uid() = user_id or public.is_admin());
drop policy if exists post_reactions_read on public.post_reactions;
create policy post_reactions_read on public.post_reactions for select using (true);
drop policy if exists post_reactions_write on public.post_reactions;
create policy post_reactions_write on public.post_reactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('content-media','content-media',true) on conflict (id) do nothing;
