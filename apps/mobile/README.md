# TABOR Mobile (Expo)

React Native + Expo app. Same Supabase backend as the web + admin.

## Run it (see the QR on your phone)
1. Install the **Expo Go** app on your phone (App Store / Google Play).
2. On your computer:
   ```
   cd "apps/mobile"
   npm install
   npx expo install --fix      # aligns native deps to the installed Expo SDK
   npx expo start
   ```
3. A **QR code** prints in the terminal. Scan it with your phone camera (iOS) or
   the Expo Go app (Android). The app opens live on your phone.
   - Phone and computer must be on the **same Wi-Fi**. If it won't connect, run
     `npx expo start --tunnel`.

## What's in this first draft
- **Auth** — sign up / sign in (Supabase). New accounts get a confirmation email.
- **Quests** tab — daily quest loop with streak, level, rank, and an XP bar (the
  3 quests toggle locally for now; saving to your record is next).
- **Status** tab — rank ladder (the Ascent), level, XP, streak, sign out.
- **Word / Body / Guild** tabs — branded pillar screens (content next).

## Notes / next
- Game math is currently a self-contained copy in `lib/game.ts`. Swap to the
  canonical `@tabor/shared` engine once running (it needs Metro monorepo config).
- Custom fonts (Cinzel, Pirata One) come next via `@expo-google-fonts`.
- This app is intentionally **not** an npm workspace member, so its native deps
  never touch the web/Vercel build. It keeps its own `node_modules`.
- Publishing: EAS Build (cloud, no Mac needed) -> Google Play Internal Testing
  ($25 one-time) / Apple TestFlight ($99/yr). See `docs/APP-BUILD-PLAN.md`.
