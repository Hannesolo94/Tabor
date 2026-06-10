# Mobile App Audit — 2026-06-10 (unverified findings, to action)

Deep review of apps/mobile (lib, tabs, feed, chat/DM, quests, fitness, onboarding,
liturgical engines, shared game package). Findings below are from the audit pass and
still need verification before fixing. Web/admin/db audits still to run.

## Bugs (worst first)

1. **HIGH — Chat loads the OLDEST 100 messages.** `lib/guild.ts:58` and `lib/social.ts:41`
   order `created_at ascending` with `limit(100)`: once a channel passes 100 messages,
   openers see ancient history only. Fix: `descending: true` + reverse.
2. **HIGH — Delete account swallows failure then signs out anyway.** `app/settings.tsx:38-41`
   never checks the `{ error }` from `supabase.rpc("delete_my_account")`. Privacy-critical:
   verify the RPC result before signing out; surface failure.
3. **MED — DM thread never loads when the partner has no public key.** `app/dm/[id].tsx:29-32`
   uses `null` for both "loading" and "no key", so the load effect never runs. Use
   `undefined` = loading vs `null` = no key.
4. **MED — Feed query has no ORDER BY before `limit(50)`.** `lib/feed.ts` getFeed: arbitrary
   50 rows once posts exceed 50. Add server-side order (published_at desc nullslast or
   scheduled_for) and ideally filter `targets->app` in the query.
5. **MED — Two liturgical engines disagree on Orthodox fixed fasts by 13 days.**
   `lib/liturgical.ts:47-48` (Julian dates; drives quest fasting notes) vs
   `lib/calendar.ts:48-49` (revised-Julian; drives Calendar UI + reminders). Nativity:
   Nov 28–Jan 6 vs Nov 15–Dec 24; Dormition: Aug 14–27 vs Aug 1–14. calendar.ts is the
   documented-correct one (revised-Julian/civil). Unify to one source; liturgical.ts also
   lacks Apostles' Fast + Wed/Fri fasts.
6. **MED — No day rollover while app stays open; XP bar stale.** `(tabs)/index.tsx` loads
   quests only on userId change (no focus/day check); `(tabs)/_layout.tsx` XpBar via
   `useProfile` fetches once, never refreshes on quest completion.
7. **MED — Tabata timer dies in background / drifts.** `components/TabataTimer.tsx:61-77`
   counts setInterval ticks; JS timers suspend when backgrounded. Anchor to Date.now()
   wall clock.
8. **LOW/MED — toggleQuest = two non-atomic writes, errors discarded.** `lib/quests.ts:207-211`
   (+ caller `.catch(() => {})`); also routine/[id] grants XP before the workout row is
   written.
9. **LOW — guilds.tsx joins via the known-broken upsert path.** `lib/social.ts:28-30`
   (direct upsert, RLS edge) instead of the `join_guild` RPC in `lib/guild.ts:25-27`;
   error unchecked, UI optimistically shows JOINED.
10. **LOW — Deuterocanon reading quests (Tobit/Judith/etc., lib/quests.ts:40-49) point at
    books absent from the 66-book bible_books view** — quest shows but "Open passage"
    silently disappears.
11. **LOW — feed/[id].tsx send() lacks try/finally; `sending` can stick true on error.**

## Performance

- **MED — Chat screens render all messages in a plain ScrollView** (guild.tsx:270-294,
  dm/[id].tsx:123-137); every keystroke re-renders all bubbles; parseMedia JSON.parse runs
  twice per media message per render. Use inverted FlatList + memoized rows (feed.tsx
  already does this right).
- LOW — useProfile is fetch-per-mount `select("*")` in 6+ places, no shared cache (also
  causes bug 6). One provider would fix both.
- LOW — feed.tsx double-fetches on first open (useEffect + useFocusEffect both fire).

## Dead code (grep-verified by the auditor)

- `components/Card.tsx` — never imported.
- `components/Pillar.tsx` — never imported (old placeholder).
- `exploreGuilds` + `ExploreGuild` in `lib/guild.ts:20-24` — unused (browse uses
  social.ts browseGuilds).
- `qa-calendar.ts` / `qa-office.ts` in app root — fine (not bundled) but belong in scripts/.
- Shared `ACHIEVEMENTS`, `DEFAULT_QUESTS`, `deriveRank`, reducers unused by mobile.

## Duplicates (worst offenders)

1. Two joinGuild implementations (guild.ts RPC vs social.ts upsert) — keep the RPC.
2. Two liturgical engines (see bug 5).
3. Two achievement catalogs: shared ACHIEVEMENTS vs mobile lib/achievements.ts HONORS
   (different IDs/thresholds; shared one dead on mobile, will drift).
4. Optimistic-reaction reducer duplicated line-for-line in feed.tsx + feed/[id].tsx —
   hoist into lib/feed.ts.
5. Chat composer logic (send/pickMedia/sendGif/attach) duplicated guild.tsx vs dm/[id].tsx;
   DM media send drops errors silently.

## Verified clean

Game math via @tabor/shared (no drift), UTC date handling (outside the liturgical
conflict), realtime channel cleanup, AsyncStorage/SecureStore use, push registration,
navigation params, exercise library FlatList.

## Still to audit (agents were cut off by session limit)

- Web storefront ((site), api, lib commerce/shipping/blog)
- Admin dashboard (server-action auth, scheduling flow, composer races, dupes like
  anthropicConfig in blog/actions.ts vs ads/actions.ts)
- Database/RLS/secrets/cron (integrations table policies, push_tokens, profiles email,
  posts_read 0074 policy, CRON_SECRET)
