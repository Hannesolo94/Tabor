# TABOR — Audit findings + cleanup status

Two deep audits (codebase efficiency + admin IA). Status tracked here.

## Admin information architecture — DONE
Flat 20-item nav regrouped into 7 sections (Overview / Commerce / Orders & Customers /
Content / Community / Growth / System), with renames (Content→Pages, Community→Broadcast).
Routes unchanged. `AdminShell.tsx`.
- Remaining (optional, page merges): Catalog tabs (Products+Collections), Returns tab inside
  Orders, move pixel editor from Settings into Marketing. ~2 days, low risk.

## Codebase cleanup

### DONE
- **H1 (HIGH, bug):** `messages.kind`/`guild_members.role` CHECK constraints rejected the
  values the app sends ('text','member','leader') — guild chat + joins were silently failing.
  Fixed in migration 0037.
- **H5:** `getBooks()` over-fetched ~31k verse rows; now reads a 66-row `bible_books` view (0039).
- **M5:** `personal_records.value` changed text→numeric (0039).
- **M6:** guild reactions now update optimistically (no full refetch per tap).
- **M7:** `notifications_user_idx` recreated with intended DESC ordering (0039).

### REMAINING (larger / sequence carefully)
- **H2 (root cause):** `packages/shared` game engine is built+tested but UNUSED; mobile runs its
  own `lib/game.ts`/`quests.ts` with DIFFERENT level/rank math. Wiring shared in retires the most
  debt (also fixes M1 brand tokens, M2 verses, M4 achievements, L6 quest defs — all forked 2-4×).
  RISK: needs Metro monorepo config + changes player-visible XP/rank numbers. Do in a worktree,
  not mid-testing. Since test data is wiped, the number change is safe to land now if chosen.
- **H3:** admin dashboard fetches full event/order tables and aggregates in JS on every load
  (`analytics-db.ts`). Move to SQL RPC/views + short cache. M-L.
- **H4:** `daily-rollover` edge fn does N+1 day_history queries; fold into shared `reconcile()`.
  (Edge fn not deployed yet, so latent.)
- **M3:** Exercise Library + roster use ScrollView for long lists; convert to FlatList.
- **M8:** mobile `supabase.ts` has hardcoded URL/key fallback; require env vars.
- **L1:** web inline hex literals → shared color constants (`lib/ui.ts`).
- **L2:** repeated supabase fetch boilerplate → a query helper; consistent error handling.
- **L4:** `setXp`/`bumpStat` read-modify-write race → atomic Postgres RPC.

**Cross-cutting:** most MEDIUM/LOW duplication stems from H2 (shared never wired). Doing H2 is the
highest-leverage cleanup but the riskiest; recommend a dedicated worktree pass.
