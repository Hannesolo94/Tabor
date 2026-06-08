-- Supabase linter: views default to SECURITY DEFINER (run as creator, bypassing the
-- caller's RLS). Make them security_invoker so they respect the querying user.
alter view if exists public.bible_books set (security_invoker = on);
