-- Deeper onboarding pre-fill: training days/week (equipment + goals already exist).
alter table public.profiles add column if not exists days_per_week int not null default 3;
