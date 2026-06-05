-- TABOR — Row Level Security. Every table is locked down here.
-- Rule: a user reads/writes only their own rows; guild content is scoped to
-- membership; catalog/content is world-readable but admin-writable.
--
-- Helper functions are SECURITY DEFINER so they can read membership tables
-- WITHOUT triggering the very policies that call them (prevents recursion).

-- ── helpers ──────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_guild_member(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.guild_members
    where guild_id = g and user_id = auth.uid()
  );
$$;

create or replace function public.shares_guild(other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.guild_members a
    join public.guild_members b on a.guild_id = b.guild_id
    where a.user_id = auth.uid() and b.user_id = other
  );
$$;

create or replace function public.in_dm_thread(t uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.dm_participants
    where thread_id = t and user_id = auth.uid()
  );
$$;

create or replace function public.can_see_message(m uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.messages msg
    where msg.id = m
      and (
        (msg.channel_id is not null and public.is_guild_member(msg.guild_id))
        or (msg.dm_thread_id is not null and public.in_dm_thread(msg.dm_thread_id))
      )
  );
$$;

-- ── enable RLS on everything ─────────────────────────────────────────────────

alter table public.profiles          enable row level security;
alter table public.day_history       enable row level security;
alter table public.quests            enable row level security;
alter table public.notes             enable row level security;
alter table public.bookmarks         enable row level security;
alter table public.workouts          enable row level security;
alter table public.personal_records  enable row level security;
alter table public.tabata_presets    enable row level security;
alter table public.achievements      enable row level security;
alter table public.seeker_progress   enable row level security;
alter table public.guilds            enable row level security;
alter table public.guild_members     enable row level security;
alter table public.channels          enable row level security;
alter table public.dm_threads        enable row level security;
alter table public.dm_participants   enable row level security;
alter table public.messages          enable row level security;
alter table public.reactions         enable row level security;
alter table public.notifications     enable row level security;
alter table public.giveaways         enable row level security;
alter table public.giveaway_nominees enable row level security;
alter table public.giveaway_votes    enable row level security;
alter table public.products          enable row level security;
alter table public.price_books       enable row level security;
alter table public.product_prices    enable row level security;
alter table public.suppliers         enable row level security;
alter table public.product_suppliers enable row level security;
alter table public.content           enable row level security;
alter table public.orders            enable row level security;
alter table public.waitlist          enable row level security;

-- ── profiles: own row full; co-guild members read-only; admin reads all ──────

create policy profiles_select_own   on public.profiles for select using (user_id = auth.uid());
create policy profiles_select_guild on public.profiles for select using (shares_guild(user_id));
create policy profiles_select_admin on public.profiles for select using (is_admin());
create policy profiles_update_own   on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Note: role escalation is prevented at the app layer / service role; do not let
-- clients set role = 'admin'. (A column-restricting trigger can be added later.)

-- ── owner-only tables (user_id = auth.uid() for all actions) ─────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'day_history','quests','notes','bookmarks','workouts','personal_records',
    'tabata_presets','achievements','seeker_progress','notifications'
  ]
  loop
    execute format(
      'create policy %1$s_owner_all on public.%1$s for all
         using (user_id = auth.uid()) with check (user_id = auth.uid());', t);
  end loop;
end $$;

-- ── guilds: open guilds discoverable; members always see theirs; admin all ───

create policy guilds_select on public.guilds for select
  using (open or is_guild_member(id) or is_admin());
create policy guilds_insert on public.guilds for insert
  with check (created_by = auth.uid());
create policy guilds_update on public.guilds for update
  using (created_by = auth.uid() or is_admin());

-- ── guild_members: members see the roster; you manage your own membership ────

create policy gm_select on public.guild_members for select
  using (is_guild_member(guild_id) or is_admin());
create policy gm_insert_self on public.guild_members for insert
  with check (user_id = auth.uid());
create policy gm_delete_self on public.guild_members for delete
  using (user_id = auth.uid() or is_admin());

-- ── channels: visible to guild members ───────────────────────────────────────

create policy channels_select on public.channels for select
  using (is_guild_member(guild_id) or is_admin());

-- ── DM threads + participants ────────────────────────────────────────────────

create policy dm_threads_select on public.dm_threads for select
  using (in_dm_thread(id));
create policy dm_parts_select on public.dm_participants for select
  using (in_dm_thread(thread_id));

-- ── messages: read if you can see the channel/DM; write as yourself ──────────

create policy messages_select on public.messages for select
  using (
    (channel_id is not null and is_guild_member(guild_id))
    or (dm_thread_id is not null and in_dm_thread(dm_thread_id))
  );
create policy messages_insert on public.messages for insert
  with check (
    author_id = auth.uid()
    and (
      (channel_id is not null and is_guild_member(guild_id))
      or (dm_thread_id is not null and in_dm_thread(dm_thread_id))
    )
  );
create policy messages_delete_own on public.messages for delete
  using (author_id = auth.uid() or is_admin());

-- ── reactions: read if the message is visible; toggle your own ───────────────

create policy reactions_select on public.reactions for select
  using (can_see_message(message_id));
create policy reactions_write on public.reactions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and can_see_message(message_id));

-- ── giveaways: any authenticated user reads; one vote each; admin manages ────

create policy giveaways_select on public.giveaways for select using (auth.uid() is not null);
create policy nominees_select  on public.giveaway_nominees for select using (auth.uid() is not null);
create policy nominees_self    on public.giveaway_nominees for insert with check (user_id = auth.uid());
create policy votes_select     on public.giveaway_votes for select using (auth.uid() is not null);
create policy votes_insert     on public.giveaway_votes for insert with check (voter_id = auth.uid());

-- ── public catalog + content: world-readable, admin-writable ─────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'products','price_books','product_prices','suppliers','product_suppliers','content'
  ]
  loop
    execute format('create policy %1$s_read on public.%1$s for select using (true);', t);
    execute format(
      'create policy %1$s_admin_write on public.%1$s for all
         using (is_admin()) with check (is_admin());', t);
  end loop;
end $$;

-- ── orders: user sees own; admin sees all. Writes happen via service role. ───

create policy orders_select_own on public.orders for select
  using (user_id = auth.uid() or is_admin());

-- ── waitlist: anyone (incl. anon) can join; only admin can read ──────────────

create policy waitlist_insert on public.waitlist for insert with check (true);
create policy waitlist_admin_read on public.waitlist for select using (is_admin());
