-- On onboarding completion: deliver the Community Guidelines to the new user
-- (1) as an in-app system notification (Inbox), and (2) by email via Resend/pg_net.
create or replace function public.on_user_onboarded() returns trigger language plpgsql security definer set search_path = public, extensions, net as $$
declare rkey text; v_email text; html text;
begin
  if coalesce(old.onboarded, false) = false and new.onboarded = true then
    -- 1) in-app no-reply system message in the Inbox
    insert into notifications (user_id, kind, title, body, read)
      values (new.user_id, 'system', 'The Covenant — read this',
        'Welcome, brother. TABOR has zero tolerance for hate, harassment, or objectionable content. An automated guardian watches the channels and our team reviews violations. Press and hold any message to report it. Walk in honor.', false);

    -- 2) guidelines email (best-effort)
    select secret into rkey from integrations where provider = 'resend' and enabled limit 1;
    v_email := new.email;
    if v_email is null then select email into v_email from auth.users where id = new.user_id; end if;
    if rkey is not null and v_email is not null then
      html := '<!DOCTYPE html><html><body style="margin:0;background:#0A0A0A"><table width="100%" bgcolor="#0A0A0A" cellpadding="0" cellspacing="0" style="padding:24px"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0E0E12;border:1px solid rgba(201,169,97,0.28)"><tr><td style="height:4px;background:#C9A961;font-size:0;line-height:4px">&nbsp;</td></tr><tr><td align="center" style="padding:30px 30px 6px"><div style="font-family:Georgia,serif;font-size:30px;letter-spacing:8px;color:#E8E2D5;font-weight:bold">TABOR</div><div style="font-family:monospace;font-size:10px;letter-spacing:4px;color:#8A847A">SONS OF FIRE</div></td></tr><tr><td style="padding:18px 32px 30px;font-family:Georgia,serif;color:#C3BDB1;font-size:15px;line-height:1.7"><div style="font-family:monospace;font-size:10px;letter-spacing:3px;color:#C9A961;margin-bottom:8px">[ THE COVENANT ]</div><h1 style="color:#E8E2D5;font-size:24px;margin:0 0 12px">Welcome to the brotherhood</h1>Walk in honor, brother. TABOR has <b>zero tolerance</b> for hate, harassment, sexual content, threats, or anything that dishonors a brother.<br/><br/>An automated guardian watches the guild channels. Break the guidelines and your message is removed and you are silenced while a human reviews it. Repeat offenders are removed.<br/><br/>Press and hold any message to <b>report</b> or <b>block</b>. You help keep this place holy.<br/><br/><a href="https://tabor.quest/community-guidelines" style="color:#C9A961">Read the full guidelines</a><br/><br/>Iron sharpens iron. Forged not bought.</td></tr></table></td></tr></table></body></html>';
      perform net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object('Authorization', 'Bearer ' || rkey, 'Content-Type', 'application/json'),
        body := jsonb_build_object('from', 'TABOR <noreply@tabor.quest>', 'to', v_email, 'subject', 'Welcome to TABOR — the Covenant', 'html', html)
      );
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_user_onboarded on public.profiles;
create trigger trg_user_onboarded after update on public.profiles for each row execute function public.on_user_onboarded();
