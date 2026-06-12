-- Orthodox jurisdiction / calendar preference. Eastern Orthodox share Pascha but
-- split on the fixed-feast calendar: New (Greek/Antiochian/OCA/Romanian) vs Old
-- (Russian/ROCOR/Serbian/Jerusalem/Athos, +13 days). Oriental Orthodox (Coptic,
-- Armenian, Ethiopian, Syriac) are a separate communion / calendar entirely.
alter table public.profiles add column if not exists orthodox_calendar text; -- 'new' | 'old' | 'oriental'

-- profiles SELECT is column-granted (migration 0077), so the new column needs its own grant.
grant select (orthodox_calendar) on public.profiles to authenticated, anon;
