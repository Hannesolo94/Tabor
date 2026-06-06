-- Audit log: append-only record of important admin actions (who/what/when).
create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor      text,             -- admin email
  action     text not null,    -- e.g. product.delete, customer.erase, settings.update
  entity     text,             -- product | customer | collection | discount | settings | ...
  entity_id  text,
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;
drop policy if exists audit_admin on public.audit_log;
create policy audit_admin on public.audit_log for all using (public.is_admin()) with check (public.is_admin());
