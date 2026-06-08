-- Chat media (images / videos / gifs). Files live in a public bucket with
-- unguessable random paths. For DMs the media URL is carried inside the E2EE body,
-- so only the participants ever learn the URL (capability security).
alter table public.messages drop constraint if exists messages_kind_check;
alter table public.messages add constraint messages_kind_check check (kind = any (array['text','user','system','media']));

insert into storage.buckets (id, name, public) values ('chat-media', 'chat-media', true) on conflict (id) do nothing;
drop policy if exists chatmedia_read on storage.objects;
create policy chatmedia_read on storage.objects for select using (bucket_id = 'chat-media');
drop policy if exists chatmedia_write on storage.objects;
create policy chatmedia_write on storage.objects for insert to authenticated with check (bucket_id = 'chat-media' and (storage.foldername(name))[1] = auth.uid()::text);
