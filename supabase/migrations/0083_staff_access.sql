-- Granular staff access: which areas a limited staff member (role='moderator') may
-- reach. Owner/admin ignore this (full access). Empty = dashboard + their own account
-- only. See apps/web/lib/access.ts for the area definitions.
alter table public.profiles add column if not exists access text[] not null default '{}';

-- profiles SELECT is column-granted (migration 0077); the new column needs its own grant
grant select (access) on public.profiles to authenticated, anon;
