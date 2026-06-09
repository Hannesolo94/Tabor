-- Design files: notes/instructions + category scope (all-apparel / all-gear designs).
alter table public.design_files add column if not exists notes text;
alter table public.design_files add column if not exists scope text; -- 'apparel' | 'gear' | null
