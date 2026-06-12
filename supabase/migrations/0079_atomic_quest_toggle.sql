-- Atomic quest toggle: the client did two writes (quests.update + apply_quest_delta),
-- which could half-apply on failure (done without XP, or XP without the flag). Do both
-- in one transaction, ownership-checked, and idempotent (no double XP if already in the
-- target state).
create or replace function public.toggle_quest(p_quest_id uuid, p_done boolean, p_xp int, p_stat text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  q_owner uuid;
  q_done boolean;
  xp_delta int;
  stat_delta int;
begin
  if uid is null then return; end if;
  select user_id, done into q_owner, q_done from quests where id = p_quest_id;
  if q_owner is null or q_owner <> uid then return; end if;   -- not the caller's quest
  if q_done is not distinct from p_done then return; end if;  -- no change -> no double apply

  update quests set done = p_done, progress = case when p_done then 1 else 0 end where id = p_quest_id;

  xp_delta := case when p_done then p_xp else -p_xp end;
  if p_stat is null then
    update profiles set xp = greatest(0, xp + xp_delta) where user_id = uid;
  else
    stat_delta := case when p_done then 1 else -1 end;
    update profiles set
      xp = greatest(0, xp + xp_delta),
      stats = jsonb_set(coalesce(stats, '{}'::jsonb), array[p_stat], to_jsonb(greatest(0, coalesce((stats->>p_stat)::int, 0) + stat_delta)), true)
    where user_id = uid;
  end if;
end;
$$;
grant execute on function public.toggle_quest(uuid, boolean, int, text) to authenticated;
