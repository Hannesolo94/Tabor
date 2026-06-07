-- L4: atomic XP + stat update (was a read-modify-write race across devices).
create or replace function public.apply_quest_delta(p_xp int, p_stat text, p_stat_delta int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_stat is null then
    update profiles set xp = greatest(0, xp + p_xp) where user_id = auth.uid();
  else
    update profiles set
      xp = greatest(0, xp + p_xp),
      stats = jsonb_set(coalesce(stats, '{}'::jsonb), array[p_stat], to_jsonb(greatest(0, coalesce((stats->>p_stat)::int, 0) + p_stat_delta)), true)
    where user_id = auth.uid();
  end if;
end; $$;
grant execute on function public.apply_quest_delta(int, text, int) to authenticated;
