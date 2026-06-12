-- Privacy: profiles.email must never be readable cross-user. The profiles_select_guild
-- / friends RLS policies grant full-row reads to other members, which exposed email.
-- RLS cannot filter columns, so we drop the table-level SELECT (which covers every
-- column incl. future ones) and re-grant SELECT column-by-column for everything except
-- email. Admin reads use the service role (bypasses grants); a user's own email comes
-- from the auth session (auth.users), not this table.
revoke select on public.profiles from authenticated, anon;

grant select (
  user_id, name, avatar_url, believer, cls, denomination, journey, fitness_level,
  equipment, goals, xp, stats, streak, best_streak, freezes, last_active, ai_opt_in,
  notif_prefs, settings, onboarded, role, created_at, updated_at, faith, char_class,
  handle, banned, public_key, days_per_week, dob, tos_accepted_at, consent,
  silenced_until, baseline_reps, limitations, baseline, difficulty, disciplines, bio,
  last_read, recent_emojis
) on public.profiles to authenticated, anon;
