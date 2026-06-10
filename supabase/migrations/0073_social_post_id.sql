-- Track the Zernio post id so we can poll live publishing status (publishing/published/failed).
alter table public.posts add column if not exists social_post_id text;
