# TABOR — Feature-Completeness Audit (built vs spec/prototype)

Snapshot of what's built across app + website + admin + backend, and the prioritized
list to reach "100%". Web + admin are ~90%+ complete; the mobile app covers all six
tabs and most deep flows. Main gaps are integrations needing keys/accounts + a handful
of prototype screens.

## TOP GAPS TO REACH 100% (prioritized)
1. **Payment gateway** — web checkout is manual/pre-order only (`apps/web/lib/payments.ts`). Wire Peach/Stripe. Highest revenue blocker. Also completes donations.
2. **Push notifications** — absent in mobile (no expo-notifications). Needs the EAS build. Only the email reminder cron exists.
3. **The System AI payload** — FIXED (edge function now accepts the messages[] the app sends). Still needs deploy + ANTHROPIC_API_KEY.
4. **Wire `@tabor/shared` into the app** — app duplicates game math in lib/game.ts + lib/quests.ts; risks web/app divergence. Configure Metro + import shared.
5. **In-app Giveaways** — tables + web banner exist; no in-app giveaway tab/voting or admin UI.
6. **Honors/Achievements + auto-unlock** — table exists; no unlock logic, no Honors screen.
7. **Notes screen (mobile)** — notes table exists; no UI.
8. **Full-screen ceremonies** — Rank-Up reveal + rich Day-Sealed / onboarding Rank-Reveal are inline cards, not the prototype's ceremonies.
9. **Multi-guild switching** — user can join many guilds; chat tab pinned to one. Add an active-guild switcher.
10. **Guild chat depth** — message reactions, role badges, locked #accountability completing the "Hold the Line" quest.
11. **SA PoD supplier** — only Printful edge fns exist; `sapod-order` + geo-routing missing (COMMERCE.md).
12. **Body extras** — History/PR screen, saved Tabata presets, live steps → Iron Body credit.
13. **Scripture extras** — Scout raid 3-question drill, denomination-aware Daily Prayers, Bookmarks list UI.
14. **Onboarding completeness** — denomination capture, manifesto, "your path is set" summary, optional forge-a-guild.
15. **Barcode nutrition** — not built; see docs/NUTRITION-PLAN.md (green-lit, Open Food Facts).
16. **Polish** — reduced-motion/sound settings, share card, stats (STR/AGI/WIS/MANA) surfacing, giveaways admin UI.

## Status by area (summary)
- **App BUILT:** email auth, full onboarding (age/consent/faith/fitness/equipment/goal/days/class), Quests + Day Sealed, full KJV reader + plans + prayer + seeker track + bookmarks(backend), exercise library + program generation + routine player + Tabata + workout logging, realtime guild chat + roster/leaderboard + in-chat report/block, cross-guild friends + E2EE DMs + blocks + guild create/join, System chat (local fallback), Store tab, Status, Inbox, Settings, Safety Center, account delete, data export, donation prompt.
- **App PARTIAL/MISSING:** push notifications (missing), @tabor/shared not wired, full ceremonies, Honors/Notes/Giveaways screens, multi-guild switcher, history/PR, reactions, role badges, stats surfacing.
- **Web BUILT:** storefront (home/shop/product/collections), cart+checkout (manual), blog, reviews, geo-pricing, announcement bar/content CMS, legal pages, give/donations, SEO, daily verse.
- **Web PARTIAL:** payment gateway (manual only), real product SKUs are a content gap.
- **Admin BUILT:** dashboard, products+media, collections, customers+tags, orders, returns, reviews, discounts, marketing/pixels, suppliers/Printful, content, community broadcast, donations, moderation, audit log, settings, AI assistant, search.
- **Admin MISSING:** giveaways management UI.
- **Backend:** all spec tables exist + many beyond. Edge fns: daily-rollover, delete-account, printful-order, printful-products, system-chat. MISSING: sapod-order (SA PoD); achievements auto-unlock logic.

> Overall: web/admin ~90%+ (blocked mainly by live payment gateway + SA supplier). Mobile strong; remaining = push, shared-engine wiring, and several prototype screens (Honors, Notes, Giveaways, ceremonies).
