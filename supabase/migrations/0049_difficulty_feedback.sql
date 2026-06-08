-- Adaptive difficulty: a per-user multiplier auto-tuned by post-quest feedback,
-- so the program personalizes beyond broad baseline math. Bounded 0.6-1.6; the
-- generator still hard-caps every output, so feedback can never break realism.
alter table public.profiles add column if not exists difficulty numeric not null default 1.0;
alter table public.day_history add column if not exists feedback text;
