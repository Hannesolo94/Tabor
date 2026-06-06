-- App onboarding (the Awakening): faith gate, fitness assessment, class.
alter table public.profiles
  add column if not exists onboarded     boolean not null default false,
  add column if not exists faith         text,   -- believer | seeker
  add column if not exists fitness_level text,   -- beginner | returning | consistent | athlete
  add column if not exists char_class    text;   -- Sentinel | Scribe | Crusader | Pilgrim

-- ensure a signed-in user can read + update their own profile (the app writes here)
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select using (auth.uid() = user_id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
