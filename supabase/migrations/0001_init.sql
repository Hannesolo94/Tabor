-- TABOR — initial schema. Ported from docs/DATA-MODEL.md and proto-state.jsx.
-- Every table gets RLS in 0002_rls.sql. This file is structure only.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- Player
-- ─────────────────────────────────────────────────────────────────────────────

-- One row per auth user. Mirrors the prototype's persisted player state.
create table public.profiles (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  name          text not null default '',
  avatar_url    text,
  believer      text not null default 'seeking'
                  check (believer in ('yes', 'seeking', 'no')),
  cls           text not null default 'Sentinel'
                  check (cls in ('Sentinel', 'Scribe', 'Crusader', 'Pilgrim')),
  denomination  text,
  journey       text,
  fitness_level text,
  equipment     text,
  goals         text[] not null default '{}',
  xp            int not null default 0,
  stats         jsonb not null default '{"STR":0,"AGI":0,"WIS":0,"MANA":0}'::jsonb,
  streak        int not null default 0,
  best_streak   int not null default 0,
  freezes       int not null default 0,
  last_active   date,
  ai_opt_in     boolean not null default true,
  notif_prefs   jsonb not null default '{"rank":true,"nudge":true,"quest":true,"streak":true,"quiet":false}'::jsonb,
  settings      jsonb not null default '{"reduced_motion":false,"sound":true}'::jsonb,
  onboarded     boolean not null default false,
  role          text not null default 'user' check (role in ('user', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.day_history (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  status  text not null check (status in ('sealed', 'frozen', 'missed')),
  primary key (user_id, day)
);

create table public.quests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  day        date not null,
  quest_key  text not null,
  pillar     text not null,
  title      text not null,
  sub        text,
  stat       text not null check (stat in ('STR', 'AGI', 'WIS', 'MANA')),
  xp         int not null default 0,
  done       boolean not null default false,
  progress   int not null default 0,
  goal       int,
  created_at timestamptz not null default now(),
  unique (user_id, day, quest_key)
);

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  cat        text not null check (cat in ('scripture', 'fitness')),
  title      text not null,
  body       text,
  ref        text,
  created_at timestamptz not null default now()
);

create table public.bookmarks (
  user_id    uuid not null references auth.users (id) on delete cascade,
  ref        text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, ref)
);

create table public.workouts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  mins       int not null default 0,
  day        date not null,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.personal_records (
  user_id uuid not null references auth.users (id) on delete cascade,
  lift    text not null,
  value   text not null,
  primary key (user_id, lift)
);

create table public.tabata_presets (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name    text not null,
  work    int not null,
  rest    int not null,
  rounds  int not null,
  moves   text[] not null default '{}'
);

create table public.achievements (
  user_id        uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.seeker_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  lesson_id    text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Brotherhood (guilds, chat) — Realtime on messages
-- ─────────────────────────────────────────────────────────────────────────────

create table public.guilds (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  tag        text,
  created_by uuid references auth.users (id) on delete set null,
  open       boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.guild_members (
  guild_id  uuid not null references public.guilds (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  role      text not null default 'Recruit'
              check (role in ('Warlord', 'Officer', 'Brother', 'Recruit')),
  joined_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

create table public.channels (
  id       uuid primary key default gen_random_uuid(),
  guild_id uuid not null references public.guilds (id) on delete cascade,
  name     text not null,
  topic    text,
  locked   boolean not null default false
);

create table public.dm_threads (
  id       uuid primary key default gen_random_uuid(),
  guild_id uuid references public.guilds (id) on delete cascade,
  is_group boolean not null default false,
  name     text
);

create table public.dm_participants (
  thread_id uuid not null references public.dm_threads (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  primary key (thread_id, user_id)
);

create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  channel_id   uuid references public.channels (id) on delete cascade,
  dm_thread_id uuid references public.dm_threads (id) on delete cascade,
  guild_id     uuid references public.guilds (id) on delete cascade,
  author_id    uuid references auth.users (id) on delete set null,
  body         text not null,
  kind         text not null default 'user' check (kind in ('user', 'system')),
  created_at   timestamptz not null default now(),
  check (channel_id is not null or dm_thread_id is not null)
);
create index messages_channel_idx on public.messages (channel_id, created_at);
create index messages_dm_idx on public.messages (dm_thread_id, created_at);

create table public.reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  emoji      text not null,
  primary key (message_id, user_id, emoji)
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('rank', 'nudge', 'guild', 'quest', 'streak')),
  title      text not null,
  body       text,
  read       boolean not null default false,
  deep_link  text,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Giveaways
-- ─────────────────────────────────────────────────────────────────────────────

create table public.giveaways (
  id          uuid primary key default gen_random_uuid(),
  month       text not null,
  prize       text,
  product_sku text,
  closes_at   timestamptz
);

create table public.giveaway_nominees (
  giveaway_id uuid not null references public.giveaways (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  primary key (giveaway_id, user_id)
);

create table public.giveaway_votes (
  giveaway_id uuid not null references public.giveaways (id) on delete cascade,
  voter_id    uuid not null references auth.users (id) on delete cascade,
  nominee_id  uuid not null references auth.users (id) on delete cascade,
  primary key (giveaway_id, voter_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Commerce (public catalog, per-region pricing, multi-supplier)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.products (
  sku         text primary key,
  printful_id text,
  name        text not null,
  collection  text check (collection in ('sentinel', 'crusader', 'scribe', 'pilgrim')),
  note        text,
  image_url   text,
  status      text not null default 'draft' check (status in ('draft', 'live')),
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.price_books (
  region   text primary key,
  currency text not null
);

create table public.product_prices (
  sku    text not null references public.products (sku) on delete cascade,
  region text not null references public.price_books (region) on delete cascade,
  price  numeric not null,
  primary key (sku, region)
);

create table public.suppliers (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  regions text[] not null default '{}'
);

create table public.product_suppliers (
  sku                 text not null references public.products (sku) on delete cascade,
  supplier_id         uuid not null references public.suppliers (id) on delete cascade,
  supplier_variant_id text,
  primary key (sku, supplier_id)
);

create table public.content (
  key   text primary key,
  value jsonb not null default '{}'::jsonb
);

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users (id) on delete set null,
  printful_order_id text,
  supplier          text,
  region            text,
  currency          text,
  status            text not null default 'pending',
  total             numeric,
  items             jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now()
);

create table public.waitlist (
  email      text primary key,
  source     text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create a profile row when an auth user signs up
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep profiles.updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime: guild chat subscribes to message inserts
-- ─────────────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.reactions;
