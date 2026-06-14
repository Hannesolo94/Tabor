-- Owner: the single account that controls the devastating actions (managing staff,
-- API keys, wiping accounts). Admins keep full operational access but cannot remove
-- staff, edit integration keys, or delete customers. Owner is a DB flag, so it does
-- not depend on env config and cannot be set through the app.
alter table public.profiles add column if not exists is_owner boolean not null default false;

-- the founder is the owner
update public.profiles set is_owner = true where lower(email) = 'haasrx@gmail.com';

-- profiles SELECT is column-granted (migration 0077); the new column needs its own grant
grant select (is_owner) on public.profiles to authenticated, anon;
