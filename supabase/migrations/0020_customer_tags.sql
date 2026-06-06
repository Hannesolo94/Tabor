-- Customer tags (manual labels on an email) for segmentation.
create table if not exists public.customer_tags (
  email      text not null,
  tag        text not null,
  created_at timestamptz not null default now(),
  primary key (email, tag)
);
create index if not exists customer_tags_tag_idx on public.customer_tags (tag);

alter table public.customer_tags enable row level security;
drop policy if exists customer_tags_admin on public.customer_tags;
create policy customer_tags_admin on public.customer_tags for all using (public.is_admin()) with check (public.is_admin());
