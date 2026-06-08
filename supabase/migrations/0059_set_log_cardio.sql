-- set_logs can now hold cardio (duration + distance), not just reps/weight.
alter table public.set_logs add column if not exists duration_sec int;
alter table public.set_logs add column if not exists distance_m numeric;
