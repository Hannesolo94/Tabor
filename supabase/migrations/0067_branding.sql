-- Brand kit: editable brand content lives in app_settings 'brand'; design-file library here.
create table if not exists public.design_files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text not null,
  mime text,
  size_bytes bigint,
  product_sku text references public.products(sku) on delete set null,
  folder text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists design_files_sku_idx on public.design_files(product_sku);
create index if not exists design_files_folder_idx on public.design_files(folder);
alter table public.design_files enable row level security; -- access is server-side (service role)
insert into storage.buckets (id, name, public) values ('design-files', 'design-files', false) on conflict (id) do nothing;
