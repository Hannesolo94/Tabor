-- Typo-tolerant user search (so "burger" finds "Buger") + strip a leading @.
create extension if not exists pg_trgm;

create or replace function public.search_users(q text)
returns table(user_id uuid, name text, handle text, cls text, xp integer)
language sql stable security definer set search_path to 'public' as $$
  with qq as (select ltrim(coalesce(q,''),'@') as t)
  select p.user_id, p.name, p.handle, p.cls, p.xp::int
  from profiles p, qq
  where p.user_id <> auth.uid() and length(qq.t) >= 2 and p.banned = false
    and (p.handle ilike '%'||qq.t||'%' or p.name ilike '%'||qq.t||'%'
         or similarity(coalesce(p.name,''), qq.t) > 0.25
         or similarity(coalesce(p.handle,''), qq.t) > 0.25)
    and not exists (select 1 from blocks b where (b.blocker = auth.uid() and b.blocked = p.user_id) or (b.blocker = p.user_id and b.blocked = auth.uid()))
  order by greatest(similarity(coalesce(p.name,''), qq.t), similarity(coalesce(p.handle,''), qq.t)) desc, p.xp desc nulls last
  limit 20;
$$;

-- Mini-profile now also returns the viewer's friendship status with this person.
drop function if exists public.get_public_profile(uuid);
create or replace function public.get_public_profile(p_user uuid)
returns table(user_id uuid, name text, handle text, bio text, denomination text, cls text, xp int, friend_status text)
language sql security definer set search_path = public as $$
  select p.user_id, p.name, p.handle, p.bio, p.denomination, p.cls, p.xp,
    coalesce((select f.status from friendships f
              where (f.requester = auth.uid() and f.addressee = p_user)
                 or (f.requester = p_user and f.addressee = auth.uid()) limit 1), 'none')
  from profiles p where p.user_id = p_user;
$$;
grant execute on function public.get_public_profile(uuid) to authenticated;
