-- The notifications.kind check from 0001 only allowed rank/nudge/guild/quest/streak,
-- but triggers insert 'system' (onboarding Covenant) and 'mod' (auto-mod alerts),
-- which blocked onboarding completion. Widen to all kinds the app uses (+ headroom).
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind = any (array['rank','nudge','guild','quest','streak','system','mod','dm','friend','honor','giveaway','broadcast','announce','ticket']));
