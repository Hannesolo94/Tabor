# Build Plan (ordered, actionable)

Work top to bottom. Each step is independently verifiable.

## 0 — Repo + workspace
- Set up a monorepo (pnpm workspaces or Turborepo): `apps/web`, `apps/mobile`,
  `packages/shared`, `supabase`, keep `design/` (prototype HTML/JSX) read-only, `docs/`.
- TypeScript strict. Shared ESLint/Prettier. Add `packages/shared` with brand tokens
  (from `docs/BRAND.md`) and game logic (from `docs/GAME-LOGIC.md`) + unit tests.

## 1 — Supabase
- Create project. Write migrations for every table in `docs/DATA-MODEL.md`. Enable RLS,
  add owner policies (`user_id = auth.uid()`) and guild-scoped policies.
- Enable Realtime on `messages`. Set up Storage bucket for avatars.
- Seed: quest pool, achievements, sample guild/channels for dev.
- Edge Functions scaffold: `system-chat`, `printful-products`, `printful-order`,
  `daily-rollover`, `delete-account`.

## 2 — Web storefront (fastest visible win)
- Next.js App Router in `apps/web`. Recreate `TABOR Website.html` / `site-store.jsx`:
  Hero, marquee, Shop (collection filter pills), Collections (4 personas), Giveaway banner,
  App strip, Creed, Footer, slide-in Cart. Responsive. Use brand tokens + Tailwind.
- `printful-products` → cache to `products` table → render. Cart → checkout
  (Shopify storefront or Stripe Checkout) → `printful-order` on success.
- **Geo-routing + multi-supplier**: detect region (Vercel Edge geo), show region price book + currency;
  at checkout the shipping address picks the supplier (Printful intl / SA PoD for Africa) and live
  shipping rate. Build the supplier router now. Full spec in `docs/COMMERCE.md`.
- **Make content data-driven** (products, prices, hero/marquee/creed copy in DB) so the `/admin` CMS
  can edit the site live. See `docs/ADMIN.md`.
- Waitlist form → `waitlist` table. Deploy to Vercel. Point `tabor.quest` at it.

## 3 — Mobile app shell (Expo)
- Expo (TypeScript) in `apps/mobile`. Install: expo-router, react-native-svg,
  @supabase/supabase-js, expo-notifications, expo-image-picker, reanimated.
- Port `TaborIconSeal` and brand tokens to RN. Build the six-tab navigator (`docs/SCREENS.md`).
- Preview on phone via **Expo Go** (QR). This is the first "on my phone" moment.

## 4 — Onboarding + core loop
- The Awakening flow (faith gate, assessment, tailored summary, rank reveal).
- Quests home (dashboard, daily quests, streak, countdown, Day-Sealed ceremony).
- Status: overview, history calendar, ranks, honors, settings, support, inbox, share card.
- Wire game logic from `packages/shared`. Persist to Supabase; reconcile on app open.

## 5 — Pillars
- Scripture: Bible reader via a Bible API (pick one in SETUP), reading plans, bookmarks,
  search, prayers, Seeker Track.
- Body: routines, workout player (rest timers), Tabata builder/timer/presets, history/PRs.
- Guild: channels/DMs/chat with Supabase Realtime + reactions, roster/roles, leaderboard,
  monthly giveaway voting. Store tab shares the web catalog.

## 6 — The System (AI)
- `system-chat` Edge Function → Claude API with the System prompt + user context.
  Graceful fallback lines if unavailable. Wire the Status → The System chat + dawn/nudge messages.

## 7 — Notifications
- Expo push tokens stored per user. `daily-rollover` and events enqueue notifications
  (rank, nudge, quest, streak) respecting `notif_prefs` + quiet hours. Also write to `notifications` table (inbox).

## 8 — Ship to test
- EAS Build (Android). Upload to Google Play **Internal Testing** (unlisted, up to 100 testers).
  Optional: EAS internal distribution APK even earlier. iOS later via TestFlight.

## 9 — Admin dashboard & CMS (see ADMIN.md)
- Build `/admin` in the Next.js app, gated by `profiles.role = 'admin'`: sales/orders dashboard,
  analytics (revenue, by-region/supplier), product CRUD with per-region price books and supplier
  variant mapping, and form-based content editing. Do NOT build a visual drag-drop page builder early.

## 10 — Hardening
- `delete-account` truly wipes everything. Auth (Apple/Google sign-in for stores).
  Moderation/report/block for guild content. Privacy policy + terms. Analytics.
  Accessibility + reduced-motion. Rate-limit the System.

## Verify as you go
- Shared game-logic unit tests pass.
- Web: Lighthouse OK, products load from Printful, checkout completes in test mode.
- App: runs in Expo Go, onboarding → quests → seal a day → rank up works end to end against Supabase.
