-- Product fields needed to fully drive the storefront from the database
-- (so the admin can edit everything). Placeholder art uses tone/ink/mark until
-- real images are uploaded to image_url.

alter table public.products
  add column if not exists tagline         text,
  add column if not exists blurb           text,
  add column if not exists tone            text default '#15151A',  -- art background
  add column if not exists ink             text default '#C9A961',  -- mark color
  add column if not exists mark            text default 'seal' check (mark in ('seal', 'word')),
  add column if not exists sizes           text[] not null default '{}',
  add column if not exists inventory       int not null default 0,
  add column if not exists track_inventory boolean not null default false;

-- base_price (from 0003) is the display price. Ensure it is non-null-ish via default.
alter table public.products alter column base_price set default 0;
