-- Editable home hero. Stored in the existing content table under key 'hero_home'.
-- Layout/positions are fixed in code; the admin edits copy, CTA text/links, and
-- an optional background image/video. CTAs cannot be moved or removed, only
-- relabeled/relinked.

insert into public.content (key, value) values (
  'hero_home',
  '{
    "eyebrow": "Sacred-Tactical Gear",
    "headline": "Wear the Climb",
    "subcopy": "Heavyweight, muted, premium. Apparel and gear forged for Christian men who train, game, and refuse to drift. Four collections, one brotherhood.",
    "bg_type": "none",
    "bg_url": "",
    "cta1_label": "Shop the Drop",
    "cta1_href": "/shop",
    "cta2_label": "Find Your Collection",
    "cta2_href": "#collections"
  }'::jsonb
)
on conflict (key) do nothing;
