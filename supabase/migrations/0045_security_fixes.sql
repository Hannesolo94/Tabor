-- QA security fixes.

-- helper: HTML-escape for in-DB emails (M2)
create or replace function public.html_escape(t text) returns text language sql immutable as $$
  select replace(replace(replace(replace(coalesce(t,''),'&','&amp;'),'<','&lt;'),'>','&gt;'),'"','&quot;');
$$;

-- H1: stop ordinary clients from editing security-critical columns on their own
-- profile (role/banned/silenced_until). Trusted contexts (service role, SECURITY
-- DEFINER RPCs running as postgres, or an actual admin) pass through.
create or replace function public.guard_profile_update() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if current_user in ('service_role','postgres','supabase_admin','supabase_auth_admin') then return new; end if;
  if public.is_admin() then return new; end if;
  new.role := old.role;
  new.banned := old.banned;
  new.silenced_until := old.silenced_until;
  return new;
end; $$;
drop trigger if exists trg_guard_profile on public.profiles;
create trigger trg_guard_profile before update on public.profiles for each row execute function public.guard_profile_update();

-- H3: push moved into an AFTER INSERT trigger that SKIPS hidden (auto-modded)
-- messages, so blocked content is never pushed to members.
create or replace function public.message_push() returns trigger language plpgsql security definer set search_path = public, extensions, net as $$
declare sender uuid := new.author_id; sender_name text; v_title text; v_body text; msgs jsonb;
begin
  if new.hidden then return new; end if;
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
drop trigger if exists trg_message_push on public.messages;
create trigger trg_message_push after insert on public.messages for each row execute function public.message_push();

-- M2: re-create guard_message with HTML-escaped values in the staff email
create or replace function public.guard_message() returns trigger language plpgsql security definer set search_path = public, extensions, net as $$
declare recent int; v_term text; v_report uuid; v_token uuid; rkey text; v_admins text[]; v_name text; html text;
begin
  if exists (select 1 from profiles p where p.user_id = new.author_id and p.banned) then raise exception 'account_suspended'; end if;
  if exists (select 1 from profiles p where p.user_id = new.author_id and p.silenced_until is not null and p.silenced_until > now()) then raise exception 'account_silenced'; end if;
  select count(*) into recent from messages m where m.author_id = new.author_id and m.created_at > now() - interval '10 seconds';
  if recent >= 8 then raise exception 'rate_limited'; end if;
  if new.channel_id is not null and new.body is not null then
    select term into v_term from mod_terms where active and severity = 'block' and position(lower(term) in lower(new.body)) > 0 limit 1;
    if v_term is not null then
      insert into reports (reporter, target_user, message_id, reason, detail, status)
        values (new.author_id, new.author_id, new.id, 'automod', 'Auto-blocked term "'||v_term||'". Text: '||left(new.body,200), 'open')
        returning id, action_token into v_report, v_token;
      update profiles set silenced_until = now() + interval '24 hours' where user_id = new.author_id;
      new.hidden := true;
      insert into notifications (user_id, kind, title, body, read)
        select user_id, 'mod', 'Auto-mod blocked a message', 'A guild message tripped the guidelines filter. Review in Moderation.', false
        from profiles where role in ('admin','moderator');
      select secret into rkey from integrations where provider = 'resend' and enabled limit 1;
      select array_agg(email) into v_admins from profiles where role in ('admin','moderator') and email is not null;
      select coalesce(name,'A brother') into v_name from profiles where user_id = new.author_id;
      if rkey is not null and v_admins is not null then
        html := '<!DOCTYPE html><html><body style="margin:0;background:#0A0A0A"><table width="100%" bgcolor="#0A0A0A" cellpadding="0" cellspacing="0" style="padding:24px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0E0E12;border:1px solid rgba(192,58,58,0.4)"><tr><td style="height:4px;background:#C03A3A;font-size:0;line-height:4px">&nbsp;</td></tr><tr><td style="padding:26px 32px;font-family:Georgia,serif;color:#C3BDB1;font-size:15px;line-height:1.6"><div style="font-family:monospace;font-size:10px;letter-spacing:3px;color:#C03A3A;margin-bottom:8px">[ AUTO-MOD ALERT ]</div><h1 style="color:#E8E2D5;font-size:22px;margin:0 0 12px">A message was auto-blocked</h1><b>'||html_escape(v_name)||'</b> tripped the guidelines filter (term: <b>'||html_escape(v_term)||'</b>). The message was hidden and the user is silenced for 24 hours.<br/><br/><div style="background:#15151A;border-left:3px solid #C03A3A;padding:10px 12px;color:#E8E2D5;font-size:14px">'||html_escape(left(new.body,200))||'</div><br/><table cellpadding="0" cellspacing="0"><tr><td bgcolor="#C9A961" style="border-radius:2px"><a href="https://tabor.quest/mod-action?token='||v_token||'" style="display:inline-block;padding:13px 28px;font-family:Georgia,serif;font-weight:bold;font-size:13px;letter-spacing:1px;color:#0A0A0A;text-decoration:none;text-transform:uppercase">Review &amp; action</a></td></tr></table></td></tr></table></td></tr></table></body></html>';
        perform net.http_post(url := 'https://api.resend.com/emails', headers := jsonb_build_object('Authorization','Bearer '||rkey,'Content-Type','application/json'), body := jsonb_build_object('from','TABOR Guardian <noreply@tabor.quest>','to',to_jsonb(v_admins),'subject','TABOR auto-mod: a message was blocked','html',html));
      end if;
    end if;
  end if;
  return new;
end; $$;
