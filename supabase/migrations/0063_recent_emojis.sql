-- Remember a user's recently used reaction emojis.
alter table public.profiles add column if not exists recent_emojis text[] not null default '{}';
