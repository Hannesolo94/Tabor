-- Nutrition / calorie tracker. Open Food Facts cache kept separate from user foods
-- (ODbL share-alike hygiene). Health data -> own-row RLS + cascades on account delete.
create table if not exists public.foods_off_cache (
  barcode text primary key,
  name text not null, brand text, serving_size_g numeric, serving_label text,
  kcal_100g numeric not null default 0, protein_100g numeric, carb_100g numeric, fat_100g numeric,
  sugar_100g numeric, fiber_100g numeric, salt_100g numeric, image_url text,
  fetched_at timestamptz not null default now()
);
create table if not exists public.foods_custom (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  barcode text, name text not null, brand text, serving_size_g numeric, serving_label text,
  kcal_100g numeric not null default 0, protein_100g numeric, carb_100g numeric, fat_100g numeric,
  is_public boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.food_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null, meal text not null check (meal in ('breakfast','lunch','dinner','snack')),
  qty_g numeric not null,
  name text not null, kcal numeric not null default 0, protein numeric, carb numeric, fat numeric,
  created_at timestamptz not null default now()
);
create index if not exists food_log_user_date on public.food_log (user_id, log_date);
create table if not exists public.nutrition_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal_type text not null default 'maintain',
  kcal_target int not null default 0, protein_target int not null default 0, carb_target int not null default 0, fat_target int not null default 0,
  weight_kg numeric, height_cm numeric, age int, sex text, activity numeric,
  updated_at timestamptz not null default now()
);

alter table public.foods_off_cache enable row level security;
alter table public.foods_custom enable row level security;
alter table public.food_log enable row level security;
alter table public.nutrition_goals enable row level security;

drop policy if exists off_read on public.foods_off_cache; create policy off_read on public.foods_off_cache for select to authenticated using (true);
drop policy if exists off_write on public.foods_off_cache; create policy off_write on public.foods_off_cache for insert to authenticated with check (true);
drop policy if exists off_update on public.foods_off_cache; create policy off_update on public.foods_off_cache for update to authenticated using (true) with check (true);

drop policy if exists custom_read on public.foods_custom; create policy custom_read on public.foods_custom for select to authenticated using (created_by = auth.uid() or is_public);
drop policy if exists custom_write on public.foods_custom; create policy custom_write on public.foods_custom for all to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists flog on public.food_log; create policy flog on public.food_log for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists ngoals on public.nutrition_goals; create policy ngoals on public.nutrition_goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
