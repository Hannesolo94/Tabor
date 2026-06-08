-- Per-set workout logging (reps + weight) so we can chart volume + strength over time.
create table if not exists public.set_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  workout_id uuid,
  exercise_id uuid,
  exercise_name text,
  set_index int,
  reps int,
  weight numeric,
  day date not null default current_date,
  created_at timestamptz default now()
);
alter table public.set_logs enable row level security;
drop policy if exists set_logs_owner on public.set_logs;
create policy set_logs_owner on public.set_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists set_logs_user_lift_day on public.set_logs(user_id, exercise_name, day);

-- Bodyweight trend (one entry per day).
create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  day date not null default current_date,
  weight numeric,
  created_at timestamptz default now(),
  unique(user_id, day)
);
alter table public.body_metrics enable row level security;
drop policy if exists body_metrics_owner on public.body_metrics;
create policy body_metrics_owner on public.body_metrics for all using (user_id = auth.uid()) with check (user_id = auth.uid());
