-- H3: aggregate analytics_events in Postgres instead of fetching every row to the
-- web server. Removes the O(events) scaling liability on the admin dashboard.
create or replace function public.dashboard_event_stats(p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security definer set search_path = public as $$
  with ev as (select type, session_id, visitor_id, referrer, created_at from analytics_events where created_at >= p_from and created_at < p_to)
  select jsonb_build_object(
    'pageviews', (select count(*) from ev where type = 'pageview'),
    'add_to_cart', (select count(*) from ev where type = 'add_to_cart'),
    'begin_checkout', (select count(*) from ev where type = 'begin_checkout'),
    'app_click', (select count(*) from ev where type = 'app_click'),
    'sessions', (select count(distinct session_id) from ev where session_id is not null),
    'visitors', (select count(distinct visitor_id) from ev where visitor_id is not null),
    'sessions_by_day', coalesce((select jsonb_agg(jsonb_build_object('day', d, 'n', n) order by d) from (
        select to_char(created_at, 'YYYY-MM-DD') d, count(distinct session_id) n
        from ev where type = 'pageview' and session_id is not null group by 1) s), '[]'::jsonb),
    'sources', coalesce((select jsonb_agg(jsonb_build_object('source', src, 'count', c) order by c desc) from (
        select case
          when referrer is null or referrer = '' then 'direct'
          when referrer ~* 'google\.' then 'google'
          when referrer ~* '(facebook|fb|instagram|t\.co|twitter|x\.com|tiktok)' then 'social'
          when referrer ~* 'tabor\.quest' then 'direct'
          else regexp_replace(regexp_replace(referrer, '^https?://(www\.)?', ''), '/.*$', '')
        end src, count(*) c
        from ev where type = 'pageview' group by 1) s), '[]'::jsonb)
  );
$$;
grant execute on function public.dashboard_event_stats(timestamptz, timestamptz) to authenticated, service_role;
create index if not exists analytics_events_created_type on public.analytics_events (created_at, type);
