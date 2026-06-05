# supabase

Migrations, Edge Functions, and seed data for the TABOR backend. Built in
**Phase 1** of `docs/BUILD-PLAN.md`.

- `migrations/` — one SQL file per table from `docs/DATA-MODEL.md` (RLS + owner policies).
- `functions/` — Edge Functions: `system-chat`, `printful-products`, `printful-order`,
  `daily-rollover`, `delete-account`. The `daily-rollover` function reuses `reconcile()`
  from `@tabor/shared` so server and client agree on streak math.
- `seed/` — quest pool, achievements, sample guild/channels for dev.

Not scaffolded yet. Needs a Supabase project + keys (see `docs/SETUP-CHECKLIST.md`).
