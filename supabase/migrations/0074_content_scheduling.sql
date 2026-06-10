-- Content scheduling: a post can be queued for a future moment. Social (IG/TikTok)
-- is scheduled inside Zernio at schedule time; app/blog/email go live via the RLS
-- clause below (visible the second the time arrives) plus a status-promotion sweep.
alter table public.posts add column if not exists scheduled_for timestamptz;
alter table public.posts add column if not exists schedule_tz text;
create index if not exists posts_scheduled_idx on public.posts (status, scheduled_for);

-- A scheduled post whose time has passed is publicly readable even before the
-- sweep flips its status to 'published'.
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select using (
  status = 'published'
  or (status = 'scheduled' and scheduled_for is not null and scheduled_for <= now())
);
