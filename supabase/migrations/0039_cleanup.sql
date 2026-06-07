-- Audit cleanups.
-- H5: 66-row view instead of over-fetching ~31k verse rows to compute book/chapter counts.
create or replace view public.bible_books as
  select book_order, min(book) as book, max(chapter) as chapters
  from public.bible_verses group by book_order;
grant select on public.bible_books to anon, authenticated;

-- M5: personal_records.value should be numeric, not text.
alter table public.personal_records alter column value type numeric using (value::numeric);

-- M7: notifications index intended DESC ordering (the 0024 re-create was a silent no-op).
drop index if exists public.notifications_user_idx;
create index notifications_user_idx on public.notifications (user_id, created_at desc);
