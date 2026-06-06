-- Community broadcasts: the team composes an announcement; it fans out to every
-- user's notifications inbox. This table is the record (and the future hook for
-- cross-posting to Discord / Instagram).
create table if not exists public.broadcasts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  deep_link  text,
  sent_by    text,
  audience   int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.broadcasts enable row level security;
drop policy if exists broadcasts_admin on public.broadcasts;
create policy broadcasts_admin on public.broadcasts for all using (public.is_admin()) with check (public.is_admin());

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
