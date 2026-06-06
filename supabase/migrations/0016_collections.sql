-- Custom collections (curated product groups) on top of the fixed persona
-- collections. Admin creates a collection, bulk-adds products, toggles visibility.
-- Persona visibility is stored in app_settings (key 'personas').

create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  visible     boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.collection_products (
  collection_id uuid not null references public.collections (id) on delete cascade,
  sku           text not null references public.products (sku) on delete cascade,
  sort          int not null default 0,
  primary key (collection_id, sku)
);

alter table public.collections enable row level security;
alter table public.collection_products enable row level security;

-- public reads visible collections + their memberships; admin manages all
drop policy if exists collections_read on public.collections;
create policy collections_read on public.collections for select using (visible = true);
drop policy if exists collections_admin on public.collections;
create policy collections_admin on public.collections for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists collection_products_read on public.collection_products;
create policy collection_products_read on public.collection_products for select using (true);
drop policy if exists collection_products_admin on public.collection_products;
create policy collection_products_admin on public.collection_products for all using (public.is_admin()) with check (public.is_admin());

-- persona visibility lives in app_settings
insert into public.app_settings (key, value) values ('personas', '{"hidden":[]}'::jsonb)
on conflict (key) do nothing;
