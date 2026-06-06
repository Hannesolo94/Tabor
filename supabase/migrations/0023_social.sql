-- Community / social layer: cross-guild friends, DMs, user-created guilds, blocks,
-- mutes. Discovery + cross-guild visibility go through SECURITY DEFINER RPCs so we
-- never expose the whole profiles table to everyone.

-- 1) handles (shareable identity for discovery)
alter table public.profiles add column if not exists handle text unique;
update public.profiles
  set handle = lower(regexp_replace(coalesce(nullif(name,''),'son'),'[^a-zA-Z0-9]','','g')) || substr(md5(user_id::text),1,4)
  where handle is null;
create index if not exists profiles_handle_idx on public.profiles (handle);

-- 2) friendships
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null,
  addressee uuid not null,
  status text not null default 'pending',  -- pending | accepted
  created_at timestamptz not null default now(),
  unique (requester, addressee)
);
alter table public.friendships enable row level security;
drop policy if exists friendships_select on public.friendships;
create policy friendships_select on public.friendships for select using (requester = auth.uid() or addressee = auth.uid());
drop policy if exists friendships_update on public.friendships;
create policy friendships_update on public.friendships for update using (requester = auth.uid() or addressee = auth.uid());
drop policy if exists friendships_delete on public.friendships;
create policy friendships_delete on public.friendships for delete using (requester = auth.uid() or addressee = auth.uid());

-- 3) blocks + mutes
create table if not exists public.blocks (blocker uuid not null, blocked uuid not null, created_at timestamptz default now(), primary key (blocker, blocked));
alter table public.blocks enable row level security;
drop policy if exists blocks_all on public.blocks;
create policy blocks_all on public.blocks for all using (blocker = auth.uid()) with check (blocker = auth.uid());

create table if not exists public.mutes (muter uuid not null, muted uuid not null, created_at timestamptz default now(), primary key (muter, muted));
alter table public.mutes enable row level security;
drop policy if exists mutes_all on public.mutes;
create policy mutes_all on public.mutes for all using (muter = auth.uid()) with check (muter = auth.uid());

-- 4) friend helper + cross-guild profile visibility for friends
create or replace function public.are_friends(other uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from friendships f where f.status = 'accepted'
    and ((f.requester = auth.uid() and f.addressee = other) or (f.requester = other and f.addressee = auth.uid())));
$$;
drop policy if exists profiles_select_friends on public.profiles;
create policy profiles_select_friends on public.profiles for select using (public.are_friends(user_id));

-- 5) RPCs (SECURITY DEFINER)
create or replace function public.ensure_handle() returns text language plpgsql security definer set search_path = public as $$
declare h text; begin
  select handle into h from profiles where user_id = auth.uid();
  if h is null then
    h := lower(regexp_replace(coalesce((select nullif(name,'') from profiles where user_id = auth.uid()),'son'),'[^a-zA-Z0-9]','','g')) || substr(md5(auth.uid()::text),1,4);
    update profiles set handle = h where user_id = auth.uid();
  end if;
  return h;
end; $$;

create or replace function public.search_users(q text) returns table(user_id uuid, name text, handle text, cls text, xp int) language sql stable security definer set search_path = public as $$
  select p.user_id, p.name, p.handle, p.cls, p.xp::int from profiles p
  where p.user_id <> auth.uid() and length(coalesce(q,'')) >= 2
    and (p.handle ilike '%'||q||'%' or p.name ilike '%'||q||'%')
    and not exists (select 1 from blocks b where (b.blocker = auth.uid() and b.blocked = p.user_id) or (b.blocker = p.user_id and b.blocked = auth.uid()))
  order by p.xp desc nulls last limit 20;
$$;

create or replace function public.list_friends() returns table(id uuid, other_id uuid, name text, handle text, cls text, xp int, status text, direction text)
language sql stable security definer set search_path = public as $$
  select f.id,
    case when f.requester = auth.uid() then f.addressee else f.requester end,
    p.name, p.handle, p.cls, p.xp::int, f.status,
    case when f.requester = auth.uid() then 'outgoing' else 'incoming' end
  from friendships f
  join profiles p on p.user_id = (case when f.requester = auth.uid() then f.addressee else f.requester end)
  where f.requester = auth.uid() or f.addressee = auth.uid();
$$;

create or replace function public.send_friend_request(target uuid) returns text language plpgsql security definer set search_path = public as $$
begin
  if target = auth.uid() then return 'self'; end if;
  if exists (select 1 from blocks b where (b.blocker = auth.uid() and b.blocked = target) or (b.blocker = target and b.blocked = auth.uid())) then return 'blocked'; end if;
  if exists (select 1 from friendships f where (f.requester = auth.uid() and f.addressee = target) or (f.requester = target and f.addressee = auth.uid())) then return 'exists'; end if;
  insert into friendships(requester, addressee, status) values (auth.uid(), target, 'pending');
  return 'sent';
end; $$;

create or replace function public.respond_friend_request(p_id uuid, p_accept boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_accept then update friendships set status = 'accepted' where id = p_id and addressee = auth.uid();
  else delete from friendships where id = p_id and (addressee = auth.uid() or requester = auth.uid()); end if;
end; $$;

create or replace function public.create_guild(p_name text, p_tag text) returns uuid language plpgsql security definer set search_path = public as $$
declare gid uuid; begin
  insert into guilds(name, tag, created_by, open) values (p_name, coalesce(nullif(p_tag,''),'I'), auth.uid(), true) returning id into gid;
  insert into channels(guild_id, name) values (gid, 'the-hall'), (gid, 'war-room');
  insert into guild_members(guild_id, user_id, role) values (gid, auth.uid(), 'leader');
  return gid;
end; $$;

create or replace function public.open_dm(other uuid) returns uuid language plpgsql security definer set search_path = public as $$
declare tid uuid; begin
  if not public.are_friends(other) then return null; end if;
  select t.id into tid from dm_threads t where t.is_group = false
    and exists (select 1 from dm_participants p where p.thread_id = t.id and p.user_id = auth.uid())
    and exists (select 1 from dm_participants p where p.thread_id = t.id and p.user_id = other) limit 1;
  if tid is null then
    insert into dm_threads(is_group) values (false) returning id into tid;
    insert into dm_participants(thread_id, user_id) values (tid, auth.uid()), (tid, other);
  end if;
  return tid;
end; $$;

create or replace function public.block_user(other uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into blocks(blocker, blocked) values (auth.uid(), other) on conflict do nothing;
  delete from friendships f where (f.requester = auth.uid() and f.addressee = other) or (f.requester = other and f.addressee = auth.uid());
end; $$;

grant execute on function public.ensure_handle, public.search_users(text), public.list_friends, public.send_friend_request(uuid), public.respond_friend_request(uuid, boolean), public.create_guild(text, text), public.open_dm(uuid), public.block_user(uuid), public.are_friends(uuid) to authenticated;
