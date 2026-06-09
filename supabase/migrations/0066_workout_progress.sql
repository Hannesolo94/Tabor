-- Save/load last entered numbers per routine exercise (progressive overload) + workout calories for charts.
alter table public.routine_exercises add column if not exists last_sets jsonb;
alter table public.workouts add column if not exists calories integer;
