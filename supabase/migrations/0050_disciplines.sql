-- Opt-in "Disciplines": bonus daily quests (fuel/fasting/spirit/discipline) layered
-- on the core 3. Spiritual content is denomination-aware.
alter table public.profiles add column if not exists disciplines jsonb not null default '{}'::jsonb;
