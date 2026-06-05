-- Admin-editable settings. Two tables:
--   app_settings  — store config (name, socials, currency, promo). Public-readable
--                   so the storefront can use it; admin-writable.
--   integrations  — third-party API keys (e.g. Omnisend). ADMIN-ONLY (holds
--                   secrets). Core infra keys (Supabase/Printful/Vercel) stay in
--                   the deployment env, never here.

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
drop policy if exists app_settings_read on public.app_settings;
create policy app_settings_read on public.app_settings for select using (true);
drop policy if exists app_settings_admin on public.app_settings;
create policy app_settings_admin on public.app_settings for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.integrations (
  provider   text primary key,
  label      text,
  secret     text,
  enabled    boolean not null default false,
  meta       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.integrations enable row level security;
drop policy if exists integrations_admin on public.integrations;
create policy integrations_admin on public.integrations for all using (public.is_admin()) with check (public.is_admin());

-- known integration placeholders
insert into public.integrations (provider, label, enabled) values
  ('omnisend', 'Omnisend (email marketing)', false)
on conflict (provider) do nothing;

-- default store settings
insert into public.app_settings (key, value) values
  ('store', '{"name":"TABOR","support_email":"","instagram":"","tiktok":"","x":"","promo_code":"FIRE10","promo_percent":10}'::jsonb)
on conflict (key) do nothing;
