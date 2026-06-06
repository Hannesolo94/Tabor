# TABOR Mobile App — Build Plan

> The mobile app is the **product**; the website sells gear and drives downloads.
> This plan turns the prototype (`TABOR App Prototype.html` + `proto-*.jsx`) into a
> real React Native app on the same Supabase backend the web already uses.

## How it integrates (the foundation already exists)
The backend the app needs is **already built and live**:
- **Supabase project** `bceysfguycepothnwvmu` — Auth, Postgres, Realtime, Storage.
- **Schema** (migrations `0001`+): `profiles`, `day_history`, `quests`, `notes`,
  `bookmarks`, `workouts`, `personal_records`, `tabata_presets`, `achievements`,
  `seeker_progress`, `guilds`, `guild_members`, `channels`, `messages` (Realtime),
  `dm_threads`, `reactions`, `notifications`, `giveaways`. RLS already enforces
  per-user + guild-scoped access.
- **Shared game engine** `packages/shared` (`@tabor/shared`) — XP/level/rank/streak/
  freeze math + brand tokens, **already unit-tested**. The app imports this so web,
  app, and Edge Functions never disagree on game logic.
- **Edge Functions** (scaffolded): `system-chat` (the AI System → Claude), 
  `daily-rollover` (streak/quest reset), `delete-account` (privacy wipe).

So "app integration" is mostly **client work** against an existing API. Auth is
Supabase Auth (email + Apple/Google); data is Supabase JS; realtime guild chat is
Supabase Realtime; the System is the `system-chat` Edge Function.

## Stack
| Concern | Choice |
|---|---|
| Framework | **Expo** (React Native) + **expo-router** (file-based nav) |
| Backend client | `@supabase/supabase-js` (+ `@react-native-async-storage/async-storage` for session) |
| Shared logic | `@tabor/shared` (game engine + brand tokens) |
| Graphics | `react-native-svg` (port `TaborIconSeal`) |
| Motion | `react-native-reanimated` |
| Push | `expo-notifications` (Expo push tokens → `notifications` table + FCM later) |
| Media | `expo-image-picker` (avatars, guild media) |
| Preview | **Expo Go** (QR) for dev; **EAS Build** for store binaries |

## Screens (six-tab navigator — from `docs/SCREENS.md`)
1. **Quests** (home) — daily 3 quests, streak, countdown, Day-Sealed ceremony.
2. **Word** (Scripture) — Bible reader (Bible API), reading plans, bookmarks, prayers, Seeker Track.
3. **Body** — routines, workout player, Tabata builder/timer, history/PRs.
4. **Guild** — channels + DMs (Realtime), roster/roles, leaderboard, monthly giveaway voting.
5. **Store** — the web catalog (shared products), deep-link to checkout on web.
6. **Status** — overview, rank, honors, history calendar, settings, support, inbox, **The System** chat.

Plus onboarding: **The Awakening** (faith gate → assessment → class reveal → rank reveal).

## Build phases
0. **Scaffold** — `apps/mobile` Expo app, expo-router, Supabase client, port brand
   tokens + `TaborIconSeal` to RN SVG. Preview in Expo Go. *(bones started — see below)*
1. **Auth + onboarding** — Supabase email/OAuth; the Awakening flow writes `profiles`.
2. **Core loop** — Quests home + Status; wire `@tabor/shared` game logic; persist to
   Supabase; reconcile streaks on open (mirror `daily-rollover`).
3. **Pillars** — Word (Bible API), Body (workout/Tabata), Guild (Realtime chat + roster).
4. **The System** — call `system-chat` Edge Function; dawn/nudge messages; graceful fallback.
5. **Push** — store Expo push tokens per user; `daily-rollover` + events enqueue
   notifications respecting `notif_prefs` + quiet hours; write to `notifications` (inbox).
6. **Ship to test** — EAS Build (Android) → Google Play **Internal Testing** (≤100 testers). iOS via TestFlight later.

## What you'll need (when we start)
- **Expo account** (free) for Expo Go + EAS.
- **EAS project** + `eas.json` build profiles (dev/preview/production).
- **Bible API key** (API.Bible / ESV / bible-api.com) for the Word pillar.
- **Google Play Developer** account ($25 one-time) for Internal Testing; Apple Developer ($99/yr) later.
- **FCM server key** (production Android push) — later.
- **ANTHROPIC_API_KEY** (already needed for the System / admin assistant).

## Admin ↔ app
- **In-app metrics dashboard** (planned, admin side): the app fires analytics events
  to the same first-party pipeline (or a mobile equivalent) → an `/admin` "App" section
  shows installs, DAU/retention, quests completed, streak distribution. Built once the
  app emits events.
- App store buttons on the web already track `app_click` → measures download intent now.

## Scaffold status
`apps/mobile/` has starter bones (Supabase client, shared-logic usage example, a
sample screen, brand seal). To run for real:
```
cd apps/mobile
npx create-expo-app@latest . --template          # (or wire the provided bones)
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-svg expo-notifications expo-image-picker react-native-reanimated expo-router
npx expo start                                    # scan QR with Expo Go
```
Note: `apps/mobile` is intentionally kept out of the web/Vercel build so its native
deps never affect the storefront deploy.
