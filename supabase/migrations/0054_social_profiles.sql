-- Pass 2: list a user's DM threads (with the other brother). E2EE, so no preview.
create or replace function public.list_dms()
returns table(thread_id uuid, other_id uuid, name text, handle text, last_at timestamptz)
language sql security definer set search_path = public as $$
  select d.thread_id, o.user_id, p.name, p.handle,
    (select max(m.created_at) from messages m where m.dm_thread_id = d.thread_id)
  from dm_participants d
  join dm_participants o on o.thread_id = d.thread_id and o.user_id <> auth.uid()
  join profiles p on p.user_id = o.user_id
  where d.user_id = auth.uid()
  order by 5 desc nulls last;
$$;
grant execute on function public.list_dms() to authenticated;

-- Fix: message_push DM branch joined dm_participants on a non-existent column
-- (dm_thread_id). The real column is thread_id -> sending a DM was failing.
create or replace function public.message_push() returns trigger language plpgsql security definer set search_path = public, extensions, net as $$
declare sender uuid := new.author_id; sender_name text; v_title text; v_body text; msgs jsonb;
begin
  if new.hidden then return new; end if;
  if new.channel_id is not null and exists (select 1 from channels c where c.id = new.channel_id and c.system = 'announcements') then return new; end if;
  select coalesce(name,'A brother') into sender_name from profiles where user_id = sender;
  if new.channel_id is not null then
    select '#'||c.name into v_title from channels c where c.id = new.channel_id;
    v_body := sender_name || ': ' || left(coalesce(new.body,''),120);
    select jsonb_agg(jsonb_build_object('to', t.token, 'title', coalesce(v_title,'Guild'), 'body', v_body, 'data', jsonb_build_object('route','/(tabs)/guild')))
      into msgs from push_tokens t
      join guild_members gm on gm.user_id = t.user_id
      join channels c on c.id = new.channel_id and c.guild_id = gm.guild_id
      join profiles p on p.user_id = t.user_id
      where t.user_id <> sender and coalesce((p.notif_prefs->'push'->>'guild')::boolean, true)
        and not exists (select 1 from blocks b where b.blocker = t.user_id and b.blocked = sender);
  elsif new.dm_thread_id is not null then
    select jsonb_agg(jsonb_build_object('to', t.token, 'title', sender_name, 'body', 'Sent you a message', 'data', jsonb_build_object('route','/dm/'||new.dm_thread_id)))
      into msgs from push_tokens t
      join dm_participants d on d.user_id = t.user_id and d.thread_id = new.dm_thread_id
      join profiles p on p.user_id = t.user_id
      where t.user_id <> sender and coalesce((p.notif_prefs->'push'->>'dm')::boolean, true)
        and not exists (select 1 from blocks b where b.blocker = t.user_id and b.blocked = sender);
  end if;
  if msgs is not null then
    perform net.http_post(url := 'https://exp.host/--/api/v2/push/send', headers := jsonb_build_object('Content-Type','application/json'), body := msgs);
  end if;
  return new;
end; $$;

-- Pass 3: public mini-profile (name, handle, bio, denomination, class, xp)
create or replace function public.get_public_profile(p_user uuid)
returns table(user_id uuid, name text, handle text, bio text, denomination text, cls text, xp int)
language sql security definer set search_path = public as $$
  select user_id, name, handle, bio, denomination, cls, xp from profiles where user_id = p_user;
$$;
grant execute on function public.get_public_profile(uuid) to authenticated;

-- Pass 3: public avatars bucket + RLS (read all, write to your own folder)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists avatars_write on storage.objects;
create policy avatars_write on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists avatars_update on storage.objects;
create policy avatars_update on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
