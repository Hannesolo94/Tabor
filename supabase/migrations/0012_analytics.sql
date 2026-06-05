-- First-party analytics. Lightweight event stream stored historically, plus a
-- per-product cost so COGS/margin are real. Events are inserted server-side
-- (via /api/track using the service role), so no public RLS insert is needed.

create table if not exists public.analytics_events (
  id         uuid primary key default gen_random_uuid(),
  type       text not null,            -- pageview | add_to_cart | begin_checkout | purchase
  path       text,
  referrer   text,
  session_id text,
  visitor_id text,
  sku        text,
  value      numeric,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_created_idx on public.analytics_events (created_at);
create index if not exists analytics_type_created_idx on public.analytics_events (type, created_at);
create index if not exists analytics_session_idx on public.analytics_events (session_id);

alter table public.analytics_events enable row level security;
-- admin-only reads; inserts happen via service role (bypasses RLS)
drop policy if exists analytics_admin on public.analytics_events;
create policy analytics_admin on public.analytics_events for all
  using (public.is_admin()) with check (public.is_admin());

-- per-product cost (what the supplier charges you) for COGS / margin
alter table public.products add column if not exists cost numeric not null default 0;
