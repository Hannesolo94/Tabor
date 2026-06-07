-- Fix constraint/code mismatch: app sends kind='text' and role='member'/'leader',
-- but 0001 only allowed kind in (user,system) and role in (Warlord/Officer/...).
-- This silently blocked guild chat sends and guild joins.
alter table public.messages drop constraint if exists messages_kind_check;
alter table public.messages add constraint messages_kind_check check (kind = any (array['text','user','system']));

alter table public.guild_members drop constraint if exists guild_members_role_check;
alter table public.guild_members add constraint guild_members_role_check check (role = any (array['leader','officer','member','recruit']));
