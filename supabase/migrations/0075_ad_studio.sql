-- Ad Studio: infrastructure for paid ads (Meta + TikTok later). Mirrors the
-- Content Studio: campaigns hold creatives, creatives hold ordered media cards
-- + ad copy (hook, primary text, headline, CTA). No platform APIs are connected
-- yet; creatives marked 'ready' wait for the day ads go live. Admin-only data.
create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  objective text not null default 'conversions',          -- awareness|traffic|engagement|leads|conversions
  platforms jsonb not null default '{"meta":true,"tiktok":false}'::jsonb,
  status text not null default 'draft',                   -- draft|ready|active|paused|archived
  budget_cents int,                                       -- planned budget (per the period in notes)
  currency text not null default 'USD',
  start_at timestamptz,
  end_at timestamptz,
  audience text,                                          -- targeting notes
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ad_creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  title text not null default 'Untitled creative',
  format text not null default 'static',                  -- static|carousel|video|reel|gif|mixed
  hook text,                                              -- the first line / scroll-stopper
  primary_text text,                                      -- body copy
  headline text,
  cta text default 'Shop now',
  link_url text,
  brief text,                                             -- rough note for AI drafting
  status text not null default 'draft',                   -- draft|review|ready
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ad_creatives_campaign_idx on public.ad_creatives(campaign_id, created_at);

create table if not exists public.ad_media (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references public.ad_creatives(id) on delete cascade,
  kind text not null default 'image',                     -- image|video|gif
  url text not null,
  poster_url text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ad_media_creative_idx on public.ad_media(creative_id, sort);

alter table public.ad_campaigns enable row level security;
alter table public.ad_creatives enable row level security;
alter table public.ad_media enable row level security;

drop policy if exists ad_campaigns_admin on public.ad_campaigns;
create policy ad_campaigns_admin on public.ad_campaigns for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists ad_creatives_admin on public.ad_creatives;
create policy ad_creatives_admin on public.ad_creatives for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists ad_media_admin on public.ad_media;
create policy ad_media_admin on public.ad_media for all using (public.is_admin()) with check (public.is_admin());
