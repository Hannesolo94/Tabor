-- Safety / moderation layer: reports, bans, and SERVER-ENFORCED rate limiting.
-- These run in the database so they can't be bypassed by a tampered client.

-- 1) ban flag
alter table public.profiles add column if not exists banned boolean not null default false;

-- 2) reports
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter    uuid not null,
  target_user uuid,
  message_id  uuid,
  reason      text not null,
  detail      text,
  status      text not null default 'open',  -- open | actioned | dismissed
  created_at  timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);
alter table public.reports enable row level security;
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert with check (reporter = auth.uid());
drop policy if exists reports_admin on public.reports;
create policy reports_admin on public.reports for all using (public.is_admin()) with check (public.is_admin());

-- 3) message guard: block banned users + rate limit (anti-flood)
create or replace function public.guard_message() returns trigger language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  if exists (select 1 from profiles p where p.user_id = new.author_id and p.banned) then
    raise exception 'account_suspended';
  end if;
  select count(*) into recent from messages m where m.author_id = new.author_id and m.created_at > now() - interval '10 seconds';
  if recent >= 8 then
    raise exception 'rate_limited';
  end if;
  return new;
end; $$;
drop trigger if exists trg_guard_message on public.messages;
create trigger trg_guard_message before insert on public.messages for each row execute function public.guard_message();

-- 4) friend-request rate limit (anti-spam)
create or replace function public.guard_friend_request() returns trigger language plpgsql security definer set search_path = public as $$
declare recent int;
begin
  select count(*) into recent from friendships f where f.requester = new.requester and f.created_at > now() - interval '60 seconds';
  if recent >= 20 then raise exception 'rate_limited'; end if;
  return new;
end; $$;
drop trigger if exists trg_guard_friend on public.friendships;
create trigger trg_guard_friend before insert on public.friendships for each row execute function public.guard_friend_request();

-- 5) hide banned users from discovery (search already excludes blocks; add banned)
create or replace function public.search_users(q text) returns table(user_id uuid, name text, handle text, cls text, xp int) language sql stable security definer set search_path = public as $$
  select p.user_id, p.name, p.handle, p.cls, p.xp::int from profiles p
  where p.user_id <> auth.uid() and length(coalesce(q,'')) >= 2 and p.banned = false
    and (p.handle ilike '%'||q||'%' or p.name ilike '%'||q||'%')
    and not exists (select 1 from blocks b where (b.blocker = auth.uid() and b.blocked = p.user_id) or (b.blocker = p.user_id and b.blocked = auth.uid()))
  order by p.xp desc nulls last limit 20;
$$;
grant execute on function public.search_users(text) to authenticated;
