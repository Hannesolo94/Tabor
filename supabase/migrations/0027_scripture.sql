-- Scripture depth: full KJV Bible (public domain) + reading plans + plan progress
-- + a prayer journal. (bookmarks + seeker_progress already exist from 0001.)

create table if not exists public.bible_verses (
  book_order int not null,
  book       text not null,
  chapter    int not null,
  verse      int not null,
  text       text not null,
  primary key (book_order, chapter, verse)
);
create index if not exists bible_book_chapter_idx on public.bible_verses (book_order, chapter);
alter table public.bible_verses enable row level security;
drop policy if exists bible_read on public.bible_verses;
create policy bible_read on public.bible_verses for select using (true);

create table if not exists public.reading_plans (
  id        text primary key,
  title     text not null,
  subtitle  text,
  days      int not null default 0,
  seeker    boolean not null default false,
  sort      int not null default 0,
  entries   jsonb not null default '[]'::jsonb   -- [{day,title,book,chapter,reflection}]
);
alter table public.reading_plans enable row level security;
drop policy if exists plans_read on public.reading_plans;
create policy plans_read on public.reading_plans for select using (true);
drop policy if exists plans_admin on public.reading_plans;
create policy plans_admin on public.reading_plans for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.plan_progress (
  user_id    uuid not null,
  plan_id    text not null references public.reading_plans (id) on delete cascade,
  day        int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, plan_id)
);
alter table public.plan_progress enable row level security;
drop policy if exists plan_progress_owner on public.plan_progress;
create policy plan_progress_owner on public.plan_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.prayers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  body       text not null,
  answered   boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists prayers_user_idx on public.prayers (user_id, created_at desc);
alter table public.prayers enable row level security;
drop policy if exists prayers_owner on public.prayers;
create policy prayers_owner on public.prayers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
