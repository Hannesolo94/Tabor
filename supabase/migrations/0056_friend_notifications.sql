-- Friend requests + acceptances now drop a notification (so they reach the bell).
create or replace function public.send_friend_request(target uuid)
returns text language plpgsql security definer set search_path to 'public' as $function$
begin
  if target = auth.uid() then return 'self'; end if;
  if exists (select 1 from blocks b where (b.blocker = auth.uid() and b.blocked = target) or (b.blocker = target and b.blocked = auth.uid())) then return 'blocked'; end if;
  if exists (select 1 from friendships f where (f.requester = auth.uid() and f.addressee = target) or (f.requester = target and f.addressee = auth.uid())) then return 'exists'; end if;
  insert into friendships(requester, addressee, status) values (auth.uid(), target, 'pending');
  insert into notifications(user_id, kind, title, body, deep_link, read)
    values (target, 'friend', 'New friend request',
            coalesce((select name from profiles where user_id = auth.uid()), 'A brother') || ' wants to connect. Tap to accept.', '/friends', false);
  return 'sent';
end; $function$;

create or replace function public.respond_friend_request(p_id uuid, p_accept boolean)
returns void language plpgsql security definer set search_path to 'public' as $function$
begin
  if p_accept then
    update friendships set status = 'accepted' where id = p_id and addressee = auth.uid();
    insert into notifications(user_id, kind, title, body, deep_link, read)
      select f.requester, 'friend', 'Friend request accepted',
             coalesce((select name from profiles where user_id = auth.uid()), 'A brother') || ' accepted your request. You can message now.', '/friends', false
      from friendships f where f.id = p_id and f.addressee = auth.uid();
  else
    delete from friendships where id = p_id and (addressee = auth.uid() or requester = auth.uid());
  end if;
end; $function$;
