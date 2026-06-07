-- In-app bug / feature reports = the ticket queue. Screenshots in a private bucket.
create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,  -- anonymize, keep the ticket
  kind text not null default 'bug' check (kind in ('bug','feature')),
  title text not null,
  body text,
  screenshots text[] not null default '{}',
  device text, app_version text,
  status text not null default 'open' check (status in ('open','triaged','resolved')),
  created_at timestamptz not null default now()
);
create index if not exists bug_reports_status_idx on public.bug_reports (status, created_at desc);
alter table public.bug_reports enable row level security;
drop policy if exists bug_insert on public.bug_reports; create policy bug_insert on public.bug_reports for insert to authenticated with check (user_id = auth.uid());
drop policy if exists bug_own on public.bug_reports; create policy bug_own on public.bug_reports for select to authenticated using (user_id = auth.uid());
drop policy if exists bug_admin on public.bug_reports; create policy bug_admin on public.bug_reports for all using (public.is_admin()) with check (public.is_admin());

-- private storage bucket for screenshots
insert into storage.buckets (id, name, public) values ('reports','reports', false) on conflict (id) do nothing;
drop policy if exists reports_upload on storage.objects;
create policy reports_upload on storage.objects for insert to authenticated with check (bucket_id = 'reports');
drop policy if exists reports_read_own on storage.objects;
create policy reports_read_own on storage.objects for select to authenticated using (bucket_id = 'reports' and owner = auth.uid());
