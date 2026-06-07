-- Compliance: age gate, ToS/consent records, and GDPR/POPIA data export.
alter table public.profiles
  add column if not exists dob date,
  add column if not exists tos_accepted_at timestamptz,
  add column if not exists consent jsonb not null default '{}'::jsonb;  -- {analytics, marketing}

-- Data export (GDPR Art. 15/20, POPIA s.23): returns the user's own data as JSON.
-- DM bodies are E2EE (only on devices) so only ciphertext/metadata is included.
create or replace function public.export_my_data() returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'exported_at', now(),
    'note', 'Direct messages are end-to-end encrypted and exist only on your devices; only metadata is included here.',
    'profile', (select to_jsonb(p) from profiles p where p.user_id = auth.uid()),
    'quests', (select coalesce(jsonb_agg(q), '[]') from quests q where q.user_id = auth.uid()),
    'day_history', (select coalesce(jsonb_agg(d), '[]') from day_history d where d.user_id = auth.uid()),
    'workouts', (select coalesce(jsonb_agg(w), '[]') from workouts w where w.user_id = auth.uid()),
    'routines', (select coalesce(jsonb_agg(r), '[]') from routines r where r.user_id = auth.uid()),
    'prayers', (select coalesce(jsonb_agg(pr), '[]') from prayers pr where pr.user_id = auth.uid()),
    'bookmarks', (select coalesce(jsonb_agg(b), '[]') from bookmarks b where b.user_id = auth.uid()),
    'plan_progress', (select coalesce(jsonb_agg(pp), '[]') from plan_progress pp where pp.user_id = auth.uid()),
    'guild_memberships', (select coalesce(jsonb_agg(gm), '[]') from guild_members gm where gm.user_id = auth.uid()),
    'messages_metadata', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'channel_id', m.channel_id, 'dm_thread_id', m.dm_thread_id, 'created_at', m.created_at)), '[]') from messages m where m.author_id = auth.uid())
  );
$$;
grant execute on function public.export_my_data() to authenticated;
