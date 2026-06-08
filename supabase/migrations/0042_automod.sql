-- Trust & Safety v2: auto-moderation bot + moderator role.
-- Runs in the DB so it can't be bypassed by a tampered client. Auto-mod scans
-- GUILD messages only (DMs are E2EE and unreadable server-side, by design).

alter table public.profiles add column if not exists silenced_until timestamptz;
alter table public.messages add column if not exists hidden boolean not null default false;

-- allow a 'moderator' tier (was user|admin)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role = any (array['user','moderator','admin']));

-- the blocklist (admin-managed). severity: 'block' = hide+silence, 'flag' = report only.
create table if not exists public.mod_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  severity text not null default 'block' check (severity in ('block','flag')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.mod_terms enable row level security;
drop policy if exists mod_terms_admin on public.mod_terms;
create policy mod_terms_admin on public.mod_terms for all using (public.is_admin()) with check (public.is_admin());

-- starter blocklist (representative — admins expand it in the dashboard)
insert into public.mod_terms (term, severity) values
  ('nigger','block'),('faggot','block'),('retard','block'),('kike','block'),('chink','block'),
  ('rape','block'),('kill yourself','block'),('kys','block'),('child porn','block'),('cp link','block'),
  ('fuck','flag'),('shit','flag'),('bitch','flag'),('cunt','flag'),('whore','flag'),('slut','flag')
on conflict (term) do nothing;

-- extended message guard: banned + silenced + rate-limit + auto-mod
create or replace function public.guard_message() returns trigger language plpgsql security definer set search_path = public as $$
declare recent int; v_term text; v_sev text;
begin
  if exists (select 1 from profiles p where p.user_id = new.author_id and p.banned) then
    raise exception 'account_suspended';
  end if;
  if exists (select 1 from profiles p where p.user_id = new.author_id and p.silenced_until is not null and p.silenced_until > now()) then
    raise exception 'account_silenced';
  end if;
  select count(*) into recent from messages m where m.author_id = new.author_id and m.created_at > now() - interval '10 seconds';
  if recent >= 8 then raise exception 'rate_limited'; end if;

  -- auto-mod: guild channel messages only (plaintext); DMs are E2EE so skipped
  if new.channel_id is not null and new.body is not null then
    select term, severity into v_term, v_sev from mod_terms
      where active and position(lower(term) in lower(new.body)) > 0
      order by case severity when 'block' then 0 else 1 end limit 1;
    if v_term is not null then
      insert into reports (reporter, target_user, message_id, reason, detail, status)
        values (new.author_id, new.author_id, new.id, 'automod',
          'Auto-flagged term "'||v_term||'" ('||v_sev||'). Text: '||left(new.body,200), 'open');
      insert into notifications (user_id, kind, title, body, read)
        select user_id, 'mod', 'Auto-mod flagged a message',
          'A guild message tripped the guidelines filter. Review in Moderation.', false
        from profiles where role in ('admin','moderator');
      if v_sev = 'block' then
        update profiles set silenced_until = now() + interval '24 hours' where user_id = new.author_id;
        new.hidden := true;  -- stored for staff review, never shown to members
      end if;
    end if;
  end if;
  return new;
end; $$;
