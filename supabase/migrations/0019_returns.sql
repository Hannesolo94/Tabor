-- Returns / RMA workflow (gateway-agnostic). The refund itself happens through
-- whatever payment gateway is connected later; this is the request + approval flow.
create table if not exists public.return_requests (
  id         uuid primary key default gen_random_uuid(),
  order_ref  text,                 -- order id (or short ref) the buyer entered
  order_id   uuid references public.orders (id) on delete set null,
  email      text not null,
  reason     text not null,        -- defect | wrong_item | sizing | other
  detail     text,
  status     text not null default 'requested', -- requested|approved|rejected|received|refunded|closed
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists return_status_idx on public.return_requests (status, created_at desc);

alter table public.return_requests enable row level security;
-- created only by the service-role API; managed by admins
drop policy if exists returns_admin on public.return_requests;
create policy returns_admin on public.return_requests for all using (public.is_admin()) with check (public.is_admin());
