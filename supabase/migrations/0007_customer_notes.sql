-- Per-customer notes / requests log for support and CRM. Keyed by email so it
-- works for both waitlist-only contacts and registered users.

create table if not exists public.customer_notes (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  body       text not null,
  author     text,
  created_at timestamptz not null default now()
);
create index if not exists customer_notes_email_idx on public.customer_notes (email, created_at desc);

alter table public.customer_notes enable row level security;

drop policy if exists customer_notes_admin on public.customer_notes;
create policy customer_notes_admin on public.customer_notes for all
  using (public.is_admin()) with check (public.is_admin());
