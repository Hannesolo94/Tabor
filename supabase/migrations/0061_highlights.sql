-- Colored verse highlights (separate from quick bookmarks).
create table if not exists public.highlights (
  user_id uuid not null references auth.users on delete cascade,
  ref text not null,
  color text not null default '#c9a961',
  created_at timestamptz default now(),
  primary key (user_id, ref)
);
alter table public.highlights enable row level security;
drop policy if exists highlights_owner on public.highlights;
create policy highlights_owner on public.highlights for all using (user_id = auth.uid()) with check (user_id = auth.uid());
