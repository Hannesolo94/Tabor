-- Tabata presets carry the full interval config (prepare/work/rest/cycles/sets/break/cooldown).
alter table public.tabata_presets add column if not exists config jsonb;
