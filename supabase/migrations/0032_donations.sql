-- Donations (collected on the WEBSITE only; app links out, per Apple/Google rules).
-- Transparent split between community-chosen charities and business operations.
create table if not exists public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null, blurb text, url text, active boolean not null default true, sort int not null default 0
);
create table if not exists public.donation_goals (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, target_amount numeric not null default 0,
  charity_split_pct int not null default 50, active boolean not null default true, sort int not null default 0
);
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  name text, email text, amount numeric not null, currency text not null default 'ZAR',
  charity_id uuid references public.charities(id) on delete set null,
  goal_id uuid references public.donation_goals(id) on delete set null,
  message text, anonymous boolean not null default false,
  status text not null default 'pending',   -- pending | completed
  created_at timestamptz not null default now()
);
create index if not exists donations_status_idx on public.donations (status, created_at desc);

alter table public.charities enable row level security;
alter table public.donation_goals enable row level security;
alter table public.donations enable row level security;
drop policy if exists charities_read on public.charities; create policy charities_read on public.charities for select using (true);
drop policy if exists charities_admin on public.charities; create policy charities_admin on public.charities for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists goals_read on public.donation_goals; create policy goals_read on public.donation_goals for select using (true);
drop policy if exists goals_admin on public.donation_goals; create policy goals_admin on public.donation_goals for all using (public.is_admin()) with check (public.is_admin());
-- donations: created via service-role API; managed by admin (no public select to protect emails)
drop policy if exists donations_admin on public.donations; create policy donations_admin on public.donations for all using (public.is_admin()) with check (public.is_admin());

-- public donor board (name + amount only, completed + non-anonymous)
create or replace function public.donor_board() returns table(name text, amount numeric, currency text, created_at timestamptz) language sql stable security definer set search_path = public as $$
  select case when anonymous then 'Anonymous' else coalesce(name,'A brother') end, amount, currency, created_at
  from donations where status = 'completed' order by created_at desc limit 100;
$$;
-- public totals
create or replace function public.donation_totals() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'raised', coalesce((select sum(amount) from donations where status='completed'),0),
    'donors', coalesce((select count(*) from donations where status='completed'),0)
  );
$$;
grant execute on function public.donor_board(), public.donation_totals() to anon, authenticated;
