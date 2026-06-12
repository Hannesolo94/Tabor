-- Multiple Bible versions / translations. Existing rows are the KJV (incl. the
-- Deuterocanon, 79 books). New versions are added under their own `version` code.
alter table public.bible_verses add column if not exists version text not null default 'kjv';
alter table public.bible_verses drop constraint if exists bible_verses_pkey;
alter table public.bible_verses add constraint bible_verses_pkey primary key (version, book_order, chapter, verse);

-- The canonical book list stays KJV-based (the fullest canon) no matter which
-- versions are added, so the reader's book list never changes shape.
create or replace view public.bible_books with (security_invoker=on) as
  select book_order, min(book) as book, max(chapter) as chapters
  from public.bible_verses where version = 'kjv' group by book_order;

create table if not exists public.bible_versions (
  code text primary key,
  name text not null,
  abbrev text not null,
  language text not null default 'English',
  public_domain boolean not null default true,
  sort int not null default 100,
  created_at timestamptz not null default now()
);
alter table public.bible_versions enable row level security;
drop policy if exists bible_versions_read on public.bible_versions;
create policy bible_versions_read on public.bible_versions for select using (true);
-- writes are service-role only (no write policy).

insert into public.bible_versions (code, name, abbrev, language, sort) values
  ('kjv', 'King James Version', 'KJV', 'English', 10)
on conflict (code) do nothing;
