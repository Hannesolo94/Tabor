-- Robust guild join: the client upsert into guild_members hit an RLS edge with
-- ON CONFLICT, leaving new users unjoined (so they couldn't send). This SECURITY
-- DEFINER RPC joins the caller reliably and also powers "explore + join" guilds.
create or replace function public.join_guild(p_guild_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if not exists (select 1 from guilds where id = p_guild_id and open) then return; end if;
  insert into guild_members (guild_id, user_id, role)
    values (p_guild_id, auth.uid(), 'member')
    on conflict (guild_id, user_id) do nothing;
end; $$;
grant execute on function public.join_guild(uuid) to authenticated;

-- List open guilds with member counts + whether the caller is in them (for explore).
create or replace function public.explore_guilds()
returns table(id uuid, name text, tag text, members bigint, joined boolean)
language sql security definer set search_path = public as $$
  select g.id, g.name, g.tag,
         (select count(*) from guild_members m where m.guild_id = g.id) as members,
         exists (select 1 from guild_members m where m.guild_id = g.id and m.user_id = auth.uid()) as joined
  from guilds g where g.open
  order by members desc, g.created_at asc;
$$;
grant execute on function public.explore_guilds() to authenticated;
