-- Track the result of cross-posting a published post to Instagram/TikTok (via Zernio).
alter table public.posts add column if not exists social_status text;
