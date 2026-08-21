-- Private gated pages (e.g. the owner's work portfolio at /w/<slug>).
--
-- This project allows public sign-up (the TABOR mobile app depends on it), so
-- "is authenticated" is NOT an access decision. A viewer must hold an explicit,
-- un-revoked grant in this table. Everything is checked server-side.
--
-- The table is deliberately service-role only: RLS is ON with NO policies, so
-- anon and authenticated get nothing, and grants are managed by the owner via
-- scripts/cv-access.mjs.

create table if not exists public.private_page_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page text not null default 'cv',
  label text,                                  -- who this grant is for, e.g. "Acme - hiring manager"
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,                      -- set = access withdrawn, row kept for the record
  last_seen_at timestamptz,
  views integer not null default 0,
  unique (user_id, page)
);

create index if not exists private_page_access_page_idx
  on public.private_page_access (page)
  where revoked_at is null;

alter table public.private_page_access enable row level security;
-- No policies on purpose: default deny for anon + authenticated. Server-side
-- code reads this with the service role only.

revoke all on public.private_page_access from anon, authenticated;

-- Access log for the owner: who opened the page, when, how often. Called by the
-- gateway with the service role only (hence INVOKER, not SECURITY DEFINER), and
-- execute is revoked from everyone else.
create or replace function public.bump_private_page_view(p_user uuid, p_page text)
returns void
language sql
set search_path = public
as $$
  update public.private_page_access
     set last_seen_at = now(), views = views + 1
   where user_id = p_user and page = p_page and revoked_at is null;
$$;

revoke all on function public.bump_private_page_view(uuid, text) from public, anon, authenticated;
