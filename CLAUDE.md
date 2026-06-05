# TABOR — Build Guide for Claude Code

> **Read this first.** This file is the entry point for building the TABOR product.
> It points to detailed specs in `/docs`. Read all of them before writing code.

## What TABOR is
A free-for-life, gamified brotherhood app for Christian men (18–40) who game, train,
and want daily scripture + real accountability. Three pillars — **Scripture Raid**,
**Fitness Guild**, **Brotherhood** — wrapped in a daily quest loop, guided by an AI
"System" that speaks like the status-window from a role-playing game. Tagline:
**"Sons of Fire."** There is also an apparel/gear arm and a marketing website.

## The single most important fact
**The HTML files in this repo (or referenced from the design project) are the
design + behavior BLUEPRINT, not production code.** They are React-in-the-browser
prototypes built for look and feel. Your job is to rebuild them properly on the
production stack below. When a spec is ambiguous, the prototype is the source of truth
for layout, copy, flow, and interaction. Match it closely.

Prototype files to study (open and read them):
- `TABOR App Prototype.html` + its `proto-*.jsx` files — the entire app
- `TABOR Website.html` + `site-*.jsx` — the storefront
- `TABOR Brand Guidelines.html`, `tokens.css`, `tabor-mark.jsx` — the brand system
- `TABOR App Plan.html` — strategy, IA, flows
- See `/docs/SCREENS.md` for a screen-by-screen map to these files.

## The stack (build on this)
| Layer | Choice | Notes |
|---|---|---|
| **Web** | Next.js (App Router) on **Vercel** | Storefront + marketing. Repo already on Vercel. |
| **Mobile app** | **React Native + Expo** | Preview live on phone via Expo Go (QR), no publishing. EAS for builds. |
| **Backend / DB** | **Supabase** | Postgres + Auth + Storage + Realtime + Edge Functions. Free tier to start. |
| **AI (the System)** | **Anthropic Claude API** | Called server-side only (Edge Function / API route). Never ship the key. |
| **Commerce** | **Printful** + a **South African PoD** | Geo-routed by destination. Pair with Shopify or Stripe Checkout. See `/docs/COMMERCE.md`. |
| **Admin/CMS** | Custom `/admin` in the Next.js app | Orders + analytics + data-driven content editing. See `/docs/ADMIN.md`. |
| **Push** | **Expo Notifications** | Free at this scale, both platforms. |
| **Shared code** | TypeScript everywhere | Share types/logic between web + app via a `/packages/shared` workspace. |

Recommended repo shape (monorepo):
```
/apps/web        → Next.js site (Vercel)
/apps/mobile     → Expo React Native app
/packages/shared → shared TS: types, brand tokens, game logic (XP/rank/streak)
/supabase        → migrations, edge functions, seed
/docs            → the specs in this folder
/design          → the prototype HTML/JSX (read-only reference)
```

## Non-negotiable conventions
- **NO EM DASHES** anywhere in UI copy, marketing, or content. Use periods, commas, colons. (Brand rule.)
- **Voice of the System**: terse, ceremonial, commanding, brotherly. Bracketed declarations
  like `[STATUS]`, `[QUEST COMPLETE]`, `[RANK ATTAINED]`. No emoji, no slang, no corporate cheer.
- **Class names**: Sentinel, Scribe, Crusader, Pilgrim.
- **Rank names** (ascent order): Recruit, Initiate, Tempered, Forged, Crucible, Ascended, Supersonic Fit.
- **Privacy is sacred**: instant data-delete must really wipe the user's data. Store only what the app needs.
- **Faith gate**: onboarding asks if the user believes in Jesus. Believers and open-hearted
  seekers enter; those who decline and do not wish to learn reach a respectful gate. Seekers
  get a Seeker Track (gospel lessons).
- Brand tokens (colors, fonts) live in `/docs/BRAND.md` and `tokens.css`. Use them, do not invent new colors.

## Build order
Follow `/docs/BUILD-PLAN.md` top to bottom. Short version:
1. Monorepo + shared package (types, brand tokens, game logic)
2. Supabase project (auth + schema from `/docs/DATA-MODEL.md`)
3. **Web** (fastest win): Next.js storefront from `TABOR Website.html` + Printful
4. **Mobile**: Expo app, port screens from the prototype (`/docs/SCREENS.md`)
5. Wire app → Supabase (auth, state, realtime guild chat)
6. The System (Claude API via Edge Function)
7. Push notifications
8. EAS build → Google Play **Internal Testing** (unlisted, up to 100 testers)

## What you need from the human
Before backend/deploy steps, ask the user for the values in
`/docs/SETUP-CHECKLIST.md` (Supabase keys, Anthropic key, Printful token, Vercel/GitHub,
EAS/Expo account, Google Play account). Do not guess or hardcode secrets; use `.env`.

## Specs in this folder
- `/docs/ARCHITECTURE.md` — system design, data flow, services
- `/docs/DATA-MODEL.md` — full Supabase schema (tables, columns, RLS)
- `/docs/SCREENS.md` — every screen, mapped to the prototype files
- `/docs/BRAND.md` — colors, type scale, voice, components
- `/docs/GAME-LOGIC.md` — XP, levels, ranks, streaks, freezes (port exactly)
- `/docs/COMMERCE.md` — geo-routing, multi-supplier fulfilment (Printful + SA PoD), price books, shipping
- `/docs/ADMIN.md` — admin dashboard + data-driven CMS + analytics
- `/docs/BUILD-PLAN.md` — ordered, actionable build steps
- `/docs/SETUP-CHECKLIST.md` — what to ask the human for
