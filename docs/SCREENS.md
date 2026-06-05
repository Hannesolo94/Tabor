# Screen Inventory (maps to the prototype)

Open the prototype files and match layout, copy, flow, and interaction closely.
Files: `TABOR App Prototype.html` loads `proto-state.jsx`, `proto-ui.jsx`, `proto-screens.jsx`,
`proto-pillars.jsx`, `proto-body.jsx`, `proto-scripture.jsx`, `proto-guild.jsx`, `proto-store.jsx`,
`proto-status.jsx`, `proto-notes.jsx`, `proto-extra.jsx`, `proto-onboard.jsx`, `proto-rankup.jsx`,
`proto-app.jsx`.

## Onboarding — The Awakening (`proto-onboard.jsx`)
Fixed-height steps, button pinned, animated choices, progress bar.
0 Splash → 1 Manifesto → 2 **Faith gate** (yes / seeking / no→respectful gate) →
3 The Calling (goals) → 4 Your Walk (faith journey) → 5 The Body (fitness level) →
6 The Arsenal (equipment) → 7 The Aim (goals) → 8 The Trials (class) → 9 The Oath (name + denomination) →
10 Forge a Guild → 11 "Your path is set" tailored summary (+ privacy/data note) → 12 Rank Reveal ceremony.

## Tab bar (`proto-ui.jsx`)
Six tabs: **Quests · Scripture (Word) · Body · Guild · Store · Status**. Solid black bar,
auto-hides on scroll down. Ceremonies are full-screen and bypass the bar.

## Quests / Home (`proto-screens.jsx`, `proto-extra.jsx`)
- Home Dashboard summary (trials held, streak, quick cards) — `HomeSummary`.
- System dawn line, streak card, live reset countdown.
- Three daily quest cards → tap routes to the pillar that completes it.
- Day-Sealed ceremony when all three done (`proto-app.jsx` DaySealed).

## Scripture / The Word (`proto-scripture.jsx`)
Hub: Verse of the Day, today's Scout raid (read + 3-question drill), then tiles:
Open the Bible (66 books, chapter reader, tap-to-bookmark), Reading Plans (progress),
Bookmarks, Search (books + verses), Daily Prayers (denomination-aware), Seeker Track
(shown when believer !== 'yes' → gospel lessons, in `proto-extra.jsx` SeekerTrack).
**Bible text comes from a Bible API in production**, not hardcoded.

## Body / Iron (`proto-body.jsx`)
Hub: System line, live steps progress toward Iron Body (partial credit), tiles for
Forge Your Own (Tabata builder + saved presets + timer) and History & PRs.
Routines tailored by rank/equipment (tag "FOR YOU"). Workout Player: exercise-by-exercise
with rest timers and a finish ceremony. Tabata Timer: work/rest/rounds circular timer.

## Guild / Brotherhood (`proto-guild.jsx`)
Discord-style. Header + section tabs: Channels (text channels incl. locked #accountability,
DMs incl. group), Roster (roles: Warlord/Officer/Brother/Recruit, presence), Ranks (streak
leaderboard), Giveaway (monthly, community vote). Chat view with reactions; posting in
#accountability completes the "Hold the Line" quest. Member profiles → message.

## Store (`proto-store.jsx`)
In-app storefront: products, detail, size, add to bag, link out to website. Real product
imagery is pending (placeholders for now). Wire to the same Printful catalog as the web.

## Status (`proto-status.jsx`, `proto-notes.jsx`, `proto-extra.jsx`)
Hamburger menu → Overview (identity, stats, streak+freeze, rank progress, share card),
Inbox (notifications), History (month calendar of sealed/frozen/missed), Ranks (ladder),
Honors (achievements), Notes (Bible + fitness; AI tracking when opted in), The System
(live AI chat), Settings (profile, denomination, notif toggles, AI opt-in, reduced motion,
data delete), Support (FAQ + contact). Delete Data = instant full wipe.

## Ceremonies (`proto-rankup.jsx`, `proto-app.jsx`)
Rank Up (full-screen reveal + notify-guild beat) and Day Sealed (gold seal ignite).
Respect `prefers-reduced-motion`.

## Website (separate — `TABOR Website.html`, `site-app.jsx`, `site-store.jsx`)
Commerce-first: Nav, Hero ("Wear the Climb"), marquee, Shop the Gear (collection filter
pills + product grid), Collections (4 persona cards), Monthly Giveaway banner, The App strip,
Creed, Footer, slide-in Cart with Printful checkout note. Responsive. Printful data attrs present.
