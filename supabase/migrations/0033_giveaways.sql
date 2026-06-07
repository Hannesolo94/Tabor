-- Giveaways: monthly community-voted draws. One vote per member per giveaway.
-- Free to enter (no payment tie) to avoid lottery/IAP issues.
alter table public.giveaways add column if not exists created_at timestamptz not null default now();
do $$ begin
  alter table public.giveaway_votes add constraint giveaway_votes_one_per_voter unique (giveaway_id, voter_id);
exception when duplicate_table then null; when duplicate_object then null; end $$;

-- active giveaway + nominees (with names + vote counts) + my vote
create or replace function public.active_giveaway() returns jsonb language sql stable security definer set search_path = public as $$
  with g as (select * from giveaways order by created_at desc limit 1)
  select case when (select id from g) is null then null else jsonb_build_object(
    'id', (select id from g), 'month', (select month from g), 'prize', (select prize from g),
    'product_sku', (select product_sku from g), 'closes_at', (select closes_at from g),
    'my_vote', (select nominee_id from giveaway_votes v where v.giveaway_id=(select id from g) and v.voter_id=auth.uid()),
    'am_nominee', exists(select 1 from giveaway_nominees n where n.giveaway_id=(select id from g) and n.user_id=auth.uid()),
    'nominees', coalesce((
      select jsonb_agg(jsonb_build_object('user_id', n.user_id, 'name', coalesce(p.name,'A brother'), 'cls', p.cls,
        'votes', (select count(*) from giveaway_votes v where v.giveaway_id=n.giveaway_id and v.nominee_id=n.user_id))
        order by (select count(*) from giveaway_votes v where v.giveaway_id=n.giveaway_id and v.nominee_id=n.user_id) desc)
      from giveaway_nominees n join profiles p on p.user_id=n.user_id where n.giveaway_id=(select id from g)), '[]'::jsonb)
  ) end;
$$;

create or replace function public.nominate_self(p_gid uuid) returns void language sql security definer set search_path = public as $$
  insert into giveaway_nominees(giveaway_id, user_id) values (p_gid, auth.uid()) on conflict do nothing;
$$;

create or replace function public.cast_giveaway_vote(p_gid uuid, p_nominee uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  delete from giveaway_votes where giveaway_id=p_gid and voter_id=auth.uid();
  insert into giveaway_votes(giveaway_id, voter_id, nominee_id) values (p_gid, auth.uid(), p_nominee);
end; $$;

grant execute on function public.active_giveaway(), public.nominate_self(uuid), public.cast_giveaway_vote(uuid, uuid) to authenticated;

-- seed a current giveaway if none
insert into public.giveaways (month, prize, closes_at)
  select to_char(now(),'YYYY-MM'), 'Sons of Fire Tee + R500 to your chosen charity', (now() + interval '20 days')
  where not exists (select 1 from giveaways);
