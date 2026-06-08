-- Remember where the reader last left off.
alter table public.profiles add column if not exists last_read jsonb;
