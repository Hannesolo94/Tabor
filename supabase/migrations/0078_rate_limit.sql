-- Server-side rate limiting for public POST endpoints (checkout, donate, review,
-- returns, subscribe). Fixed-window counter per (bucket) key, evaluated atomically
-- in a SECURITY DEFINER function so the client can never read or tamper with it.
create table if not exists public.rate_limits (
  bucket text primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);
alter table public.rate_limits enable row level security;
-- no policies: only the service role (and the definer function) may touch this table.

create or replace function public.hit_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean   -- true = allowed, false = over the limit
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.rate_limits%rowtype;
  now_ts timestamptz := now();
  cutoff timestamptz := now() - make_interval(secs => p_window_seconds);
begin
  insert into public.rate_limits (bucket, count, window_start)
    values (p_key, 1, now_ts)
    on conflict (bucket) do update
      set count = case when public.rate_limits.window_start < cutoff then 1 else public.rate_limits.count + 1 end,
          window_start = case when public.rate_limits.window_start < cutoff then now_ts else public.rate_limits.window_start end
    returning * into rec;
  return rec.count <= p_limit;
end;
$$;
revoke all on function public.hit_rate_limit(text, int, int) from anon, authenticated;
