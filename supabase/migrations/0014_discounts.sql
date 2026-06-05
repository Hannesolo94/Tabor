-- Discount codes. Created/managed in admin now; validated + applied at checkout
-- (server-side) once payments are live. Admin-only (codes are not publicly listed).

create table if not exists public.discount_codes (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  percent        int not null check (percent between 1 and 100),
  active         boolean not null default true,
  starts_at      timestamptz,
  ends_at        timestamptz,
  usage_limit    int,                 -- null = unlimited
  used_count     int not null default 0,
  once_per_email boolean not null default true,
  note           text,
  created_at     timestamptz not null default now()
);

alter table public.discount_codes enable row level security;
drop policy if exists discount_admin on public.discount_codes;
create policy discount_admin on public.discount_codes for all
  using (public.is_admin()) with check (public.is_admin());

-- the promo-popup code, made real
insert into public.discount_codes (code, percent, active, once_per_email, note) values
  ('FIRE10', 10, true, true, 'First-order popup discount')
on conflict (code) do nothing;
