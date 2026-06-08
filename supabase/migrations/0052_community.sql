-- Global community structure: an Announcements board (admins post, everyone reads)
-- and a Community chat (everyone). Both live in one global "TABOR Community" guild
-- that every user belongs to. Plus profile bio for the social layer.
alter table public.profiles add column if not exists bio text;
alter table public.channels add column if not exists system text; -- tags global channels

do $$
declare gid uuid;
begin
  select id into gid from guilds where name = 'TABOR Community' limit 1;
  if gid is null then
    insert into guilds (name, tag, open) values ('TABOR Community', 'ALL', true) returning id into gid;
  end if;
  if not exists (select 1 from channels where guild_id = gid and system = 'announcements') then
    insert into channels (guild_id, name, locked, system) values (gid, 'announcements', true, 'announcements');
  end if;
  if not exists (select 1 from channels where guild_id = gid and system = 'community') then
    insert into channels (guild_id, name, locked, system) values (gid, 'community', false, 'community');
  end if;
  -- everyone joins the community guild
  insert into guild_members (guild_id, user_id, role)
    select gid, p.user_id, 'member' from profiles p
    on conflict (guild_id, user_id) do nothing;
end $$;

-- auto-join new members to the community guild
create or replace function public.join_community() returns trigger language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  select id into gid from guilds where name = 'TABOR Community' limit 1;
  if gid is not null then
    insert into guild_members (guild_id, user_id, role) values (gid, new.user_id, 'member') on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists trg_join_community on public.profiles;
create trigger trg_join_community after insert on public.profiles for each row execute function public.join_community();

-- locked channels (e.g. #announcements): only admins/moderators may post
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert with check (
  author_id = auth.uid() and (
    (channel_id is not null and is_guild_member(guild_id)
      and (is_admin() or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','moderator'))
           or not exists (select 1 from channels c where c.id = channel_id and c.locked)))
    or (dm_thread_id is not null and in_dm_thread(dm_thread_id))
  )
);
