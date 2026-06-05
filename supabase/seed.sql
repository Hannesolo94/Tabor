-- TABOR — dev seed. Safe to run on a fresh project (no FKs to real auth users).
-- Real per-user rows (profiles, achievements) are created on signup.

-- Price books / regions (see docs/COMMERCE.md). Tune currencies later.
insert into public.price_books (region, currency) values
  ('INTL', 'USD'),
  ('ZA',   'ZAR'),
  ('EU',   'EUR'),
  ('UK',   'GBP')
on conflict (region) do nothing;

-- Suppliers: Printful for international, a SA print-on-demand for Africa.
insert into public.suppliers (name, regions) values
  ('Printful', array['INTL','EU','UK']),
  ('SA PoD',   array['ZA'])
on conflict do nothing;

-- Data-driven site copy (editable later from /admin). No em dashes (brand rule).
insert into public.content (key, value) values
  ('hero', '{"eyebrow":"Sons of Fire","headline":"Forged not bought.","sub":"Daily scripture, real iron, true brotherhood. Free for life."}'::jsonb),
  ('marquee', '{"items":["Iron sharpens iron.","No one climbs alone.","Free for life.","Forged not bought."]}'::jsonb),
  ('creed', '{"lines":["We rise before the sun.","We carry the Word.","We hold the line for our brothers.","We climb together."]}'::jsonb)
on conflict (key) do update set value = excluded.value;

-- A demo guild + channels for dev (created_by null = system seed).
insert into public.guilds (id, name, tag, created_by, open) values
  ('00000000-0000-0000-0000-00000000ee01', 'Sons of Tabor', 'IV', null, true)
on conflict (id) do nothing;

insert into public.channels (guild_id, name, topic, locked) values
  ('00000000-0000-0000-0000-00000000ee01', 'war-room', 'Daily check-ins and accountability.', false),
  ('00000000-0000-0000-0000-00000000ee01', 'scripture', 'What the Word is saying today.', false),
  ('00000000-0000-0000-0000-00000000ee01', 'the-forge', 'Training, PRs, and the iron.', false)
on conflict do nothing;
