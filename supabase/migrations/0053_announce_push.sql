-- message_push must NOT push announcement-board posts: the admin broadcast already
-- sends its own notification + push, so pushing the board message too = double.
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
      join dm_participants d on d.user_id = t.user_id and d.dm_thread_id = new.dm_thread_id
      join profiles p on p.user_id = t.user_id
      where t.user_id <> sender and coalesce((p.notif_prefs->'push'->>'dm')::boolean, true)
        and not exists (select 1 from blocks b where b.blocker = t.user_id and b.blocked = sender);
  end if;
  if msgs is not null then
    perform net.http_post(url := 'https://exp.host/--/api/v2/push/send', headers := jsonb_build_object('Content-Type','application/json'), body := msgs);
  end if;
  return new;
end; $$;
