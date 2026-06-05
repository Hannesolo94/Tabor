# Setup Checklist — what Claude Code should ask the human for

Do NOT hardcode secrets. Use `.env` (and Vercel/EAS/Supabase secret stores). Ask the user
for each value when you reach the step that needs it. `.env.example` should list every key with
blanks. Items marked (later) are not needed for first dev runs.

## GitHub / repo
- [ ] Repo is created and cloned. Confirm the monorepo structure is OK to scaffold.
- [ ] Default branch + whether to use PR previews.

## Vercel (web)
- [ ] Vercel project linked to the repo. Framework preset: **Next.js** (auto-detected) for the real
      build (the prototype HTML would be "Other", but we are building Next.js).
- [ ] Root directory = `apps/web`.
- [ ] Production domain: **tabor.quest** (user owns it). Add it in Vercel → DNS.
- [ ] Env vars to add in Vercel (and local `.env`):
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
      and server-only keys (Printful, Stripe/Shopify) as needed.

## Supabase (backend)
- [ ] Create a Supabase project (free tier). Provide:
      `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only),
      DB connection string for migrations.
- [ ] Confirm auth providers to enable: email, Apple, Google.
- [ ] (Brad owns the data side — coordinate schema review with him.)

## Anthropic (the System AI)
- [ ] `ANTHROPIC_API_KEY` (used only inside the `system-chat` Edge Function, never client-side).
- [ ] Confirm model + monthly budget/limit.

## Printful (commerce)
- [ ] `PRINTFUL_API_KEY` (store API token). Used for international orders.
- [ ] Decide checkout path: Printful + **Shopify** storefront, or **Stripe Checkout** + Printful order API.
      If Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- [ ] Map product SKUs → Printful product/variant IDs (the web cards already carry `data-sku`).

## South African PoD (commerce — African orders, see COMMERCE.md)
- [ ] Pick the SA PoD provider. Confirm: **order API** + **live shipping-rate API** (or flat-rate table).
- [ ] `SAPOD_API_KEY` (or equivalent). Map SKUs → SA PoD variant IDs.
- [ ] Confirm catalog covers the line (heavyweight tee, hoodie, crewneck, caps) and garment parity with Printful.

## Admin / analytics (see ADMIN.md)
- [ ] Designate the **admin** user (set `profiles.role = 'admin'`).
- [ ] (Optional) PostHog for behavioural analytics: `POSTHOG_KEY`.

## Bible content (Scripture pillar)
- [ ] Pick a Bible API and get a key: API.Bible (scripture.api.bible) or ESV API or bible-api.com (free, KJV).
      Provide `BIBLE_API_KEY`. Confirm translations allowed for commercial use.

## Expo / mobile
- [ ] Expo account (free) for Expo Go preview. For builds: EAS — `EAS project ID`, Expo login.
- [ ] `eas.json` build profiles (development, preview, production).
- [ ] Push: Expo handles credentials; for production Android you'll add an FCM server key (later).

## Google Play (Android testing) — (later, at step 8)
- [ ] Google Play Developer account ($25 one-time).
- [ ] App created in Play Console; **Internal Testing** track; tester emails (up to 100).
- [ ] Upload AAB from `eas build -p android`.

## Apple (iOS) — (later, optional)
- [ ] Apple Developer account ($99/yr), TestFlight for testing.

## Analytics / ops — (later)
- [ ] Choose analytics (PostHog free tier fits). `POSTHOG_KEY`.
- [ ] Error tracking (Sentry free tier).

---
### First-run minimum (to see something live)
Web on the domain: Vercel + Supabase URL/anon key + Printful key.
App on your phone: Expo account + Supabase URL/anon key. Everything else can come as you reach it.
