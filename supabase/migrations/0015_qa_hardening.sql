-- QA hardening: tighten review media, add email to profiles (kills the
-- listUsers() scan), and add hot-path indexes.

-- 1) review-media bucket: cap size + restrict to images/video
update storage.buckets
set file_size_limit = 31457280,  -- 30 MB
    allowed_mime_types = array['image/png','image/jpeg','image/jpg','image/webp','image/gif','video/mp4','video/quicktime','video/webm']
where id = 'review-media';

-- review_media rows are only written by the service-role API route now
drop policy if exists review_media_insert on public.review_media;

-- 2) profiles.email (so we look up by email instead of paging all auth users)
alter table public.profiles add column if not exists email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.user_id and p.email is null;
create index if not exists profiles_email_idx on public.profiles (email);

-- keep email in sync on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email)
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$;

-- 3) hot-path indexes
create index if not exists products_status_sort_idx on public.products (status, sort);
create index if not exists products_printful_id_idx on public.products (printful_id);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at);
