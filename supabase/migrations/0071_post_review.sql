-- Content review workflow: AI-drafted posts sit in status='review' awaiting approval;
-- feedback holds the human's change requests for a re-draft.
alter table public.posts add column if not exists feedback text;
