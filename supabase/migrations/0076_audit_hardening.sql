-- Audit hardening (QA pass 2026-06-12).

-- 1) design_files: RLS was enabled with no policy (deny-all; only the service role
--    could touch it). Add the explicit admin policy so it matches every other admin
--    table and works from the server (RLS) context too, not just the service role.
drop policy if exists design_files_admin on public.design_files;
create policy design_files_admin on public.design_files for all using (public.is_admin()) with check (public.is_admin());

-- 2) day_history: the daily-reminder cron filters by (day, status='sealed') but the
--    only index is the (user_id, day) PK, forcing a scan. Add a supporting index.
create index if not exists day_history_status_day_idx on public.day_history (status, day);

-- 3) Discount usage: checkout read used_count then wrote used_count+1, a lost-update
--    race under concurrency. Replace with an atomic single-statement increment.
create or replace function public.bump_discount_use(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.discount_codes set used_count = coalesce(used_count, 0) + 1 where code = p_code;
$$;
revoke all on function public.bump_discount_use(text) from anon, authenticated;
