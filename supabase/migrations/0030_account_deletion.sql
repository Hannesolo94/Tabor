-- In-app account deletion (Apple 5.1.1(v), Google Play, GDPR/POPIA right to erasure).
-- SECURITY DEFINER so a signed-in user can erase ALL their own data + auth row.
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return; end if;
  delete from messages where author_id = uid;
  delete from friendships where requester = uid or addressee = uid;
  delete from blocks where blocker = uid or blocked = uid;
  delete from mutes where muter = uid or muted = uid;
  delete from reports where reporter = uid or target_user = uid;
  delete from notifications where user_id = uid;
  delete from quests where user_id = uid;
  delete from day_history where user_id = uid;
  delete from workouts where user_id = uid;
  delete from personal_records where user_id = uid;
  delete from bookmarks where user_id = uid;
  delete from prayers where user_id = uid;
  delete from plan_progress where user_id = uid;
  delete from routines where user_id = uid;            -- cascades routine_exercises
  delete from guild_members where user_id = uid;
  delete from dm_participants where user_id = uid;
  delete from seeker_progress where user_id = uid;
  delete from notes where user_id = uid;
  delete from achievements where user_id = uid;
  delete from profiles where user_id = uid;
  delete from auth.users where id = uid;               -- removes the login
end; $$;
grant execute on function public.delete_my_account() to authenticated;
