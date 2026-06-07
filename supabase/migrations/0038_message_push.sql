-- DM + guild message push via pg_net -> Expo Push API (no edge function needed).
-- Respects push prefs + blocks. DM bodies are generic (E2EE: server never sees content).
create extension if not exists pg_net;

create or replace function public.notify_message(p_channel uuid, p_dm uuid, p_body text)
returns void language plpgsql security definer set search_path = public, extensions, net as $$
declare
  sender uuid := auth.uid();
  sender_name text;
  v_title text;
  v_body text;
  msgs jsonb;
begin
  if sender is null then return; end if;
  select coalesce(name, 'A brother') into sender_name from profiles where user_id = sender;

  if p_channel is not null then
    select '#' || c.name into v_title from channels c where c.id = p_channel;
    v_body := sender_name || ': ' || left(coalesce(p_body, ''), 120);
    select jsonb_agg(jsonb_build_object('to', t.token, 'title', coalesce(v_title, 'Guild'), 'body', v_body, 'data', jsonb_build_object('route', '/(tabs)/guild')))
      into msgs
    from push_tokens t
    join guild_members gm on gm.user_id = t.user_id
    join channels c on c.id = p_channel and c.guild_id = gm.guild_id
    join profiles p on p.user_id = t.user_id
    where t.user_id <> sender
      and coalesce((p.notif_prefs->'push'->>'guild')::boolean, true)
      and not exists (select 1 from blocks b where b.blocker = t.user_id and b.blocked = sender);
  elsif p_dm is not null then
    select jsonb_agg(jsonb_build_object('to', t.token, 'title', sender_name, 'body', 'Sent you a message', 'data', jsonb_build_object('route', '/dm/' || p_dm)))
      into msgs
    from push_tokens t
    join dm_participants d on d.user_id = t.user_id and d.dm_thread_id = p_dm
    join profiles p on p.user_id = t.user_id
    where t.user_id <> sender
      and coalesce((p.notif_prefs->'push'->>'dm')::boolean, true)
      and not exists (select 1 from blocks b where b.blocker = t.user_id and b.blocked = sender);
  end if;

  if msgs is not null then
    perform net.http_post(url := 'https://exp.host/--/api/v2/push/send', headers := jsonb_build_object('Content-Type', 'application/json'), body := msgs);
  end if;
end; $$;
grant execute on function public.notify_message(uuid, uuid, text) to authenticated;
