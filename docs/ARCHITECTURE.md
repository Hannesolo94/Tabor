# Architecture

## Overview
Two clients (web + mobile) over one Supabase backend. The mobile app is the product;
the website sells gear and drives downloads.

```
              ┌──────────────┐        ┌──────────────┐
              │  Next.js Web  │        │ Expo RN App   │
              │  (Vercel)     │        │ (iOS/Android) │
              └──────┬───────┘        └──────┬───────┘
                     │                        │
                     │   Supabase JS client   │
                     ▼                        ▼
              ┌─────────────────────────────────────┐
              │             SUPABASE                 │
              │  Postgres · Auth · Storage · Realtime │
              │  Edge Functions (server-side secrets) │
              └───────┬──────────────┬───────────────┘
                      │              │
                      ▼              ▼
              ┌────────────┐  ┌──────────────┐
              │ Claude API │  │   Printful    │
              │ (System)   │  │  (fulfilment) │
              └────────────┘  └──────────────┘
```

## Clients
### Web (`/apps/web`) — Next.js App Router on Vercel
- Marketing storefront. Source of truth for layout: `TABOR Website.html` + `site-store.jsx`.
- Commerce-first: hero, persona collections (Sentinel/Crusader/Scribe/Pilgrim), product grid,
  cart, app download, creed. Products carry `data-printful-id` / `data-sku` hooks already.
- Checkout via Printful (Shopify storefront API, or Stripe Checkout + Printful order API).
- Waitlist email capture → Supabase table.
- Static/ISR pages; product data from Printful API (cache it).

### Mobile (`/apps/mobile`) — Expo React Native
- The full app. Source of truth: `TABOR App Prototype.html` + `proto-*.jsx`.
- Six tabs: Quests (home), Scripture (Word), Body, Guild, Store, Status.
- Local-first feel; sync state to Supabase. Realtime for guild chat.
- Expo Notifications for push. Expo Go for dev preview, EAS for builds.

## Backend — Supabase
- **Auth**: email + OAuth (Apple/Google for app stores). Row Level Security on every table.
- **Postgres**: schema in `/docs/DATA-MODEL.md`. User owns their rows (RLS by `auth.uid()`).
- **Storage**: avatar uploads, any user media.
- **Realtime**: guild channels + DMs subscribe to `messages` inserts.
- **Edge Functions** (Deno, hold secrets):
  - `system-chat` → proxies to Claude API with the System prompt + user context.
  - `printful-order` / `printful-products` → server-side Printful calls.
  - `daily-rollover` (scheduled) → reconcile streaks/freezes, issue new daily quests.
  - `delete-account` → hard-wipe all user data (honor the privacy promise).

## The System (AI guide)
- Edge Function `system-chat`. System prompt: terse, ceremonial, brotherly, no emoji, no em dashes,
  2–4 short sentences. Inject user context (name, class, rank, level, streak, denomination, goals).
- The prototype reference is `proto-notes.jsx` (`SystemChat`) and uses a fallback string list when
  no model is reachable — keep a graceful fallback.
- Also used for: dawn greetings, streak warnings, encouragement (can be templated + AI-augmented).

## Commerce flow
1. `printful-products` Edge Function pulls catalog → cache in Postgres `products` table.
2. Web renders products; collection = brand persona (see `site-store.jsx`).
3. Cart → checkout (Shopify or Stripe) → on payment, `printful-order` submits the order to Printful.
4. Monthly giveaway: community votes (table `giveaway_votes`), winner gets a Printful order.

## Daily loop & scheduling
- `daily-rollover` runs at user-local midnight (or a daily cron + per-user timezone check):
  reset quests, increment/break streak, apply freezes, write to `day_history`.
- Game math (XP→level→rank, streak, freeze) is in `/packages/shared` so web + app + functions agree.
  Port it exactly from `proto-state.jsx` (see `/docs/GAME-LOGIC.md`).

## Environments
- `dev` (local + Expo Go + Supabase dev project), `preview` (Vercel previews), `prod`.
- Secrets via `.env` (never commit). See `/docs/SETUP-CHECKLIST.md`.
