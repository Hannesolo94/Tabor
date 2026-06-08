-- Fitness calibration for personalized quest scaling.
alter table public.profiles add column if not exists baseline_reps int;   -- push-ups in one set
alter table public.profiles add column if not exists limitations text;     -- injuries / things to avoid (safety)
