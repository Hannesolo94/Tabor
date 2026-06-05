# TABOR — Sons of Fire

A free-for-life, gamified brotherhood app for Christian men (18-40): daily scripture,
fitness, and real accountability, guided by an AI "System" that speaks like a role-playing
game status window. Plus an apparel arm and a marketing site.

> Start with [`CLAUDE.md`](CLAUDE.md) and the specs in [`docs/`](docs/). The prototype
> HTML/JSX files are the design blueprint, not production code.

## Monorepo layout

```
apps/web        → Next.js storefront + marketing + /admin (Vercel)   — Phase 2
apps/mobile     → Expo React Native app (Expo Go / EAS)              — Phase 3+
packages/shared → shared TS: types, brand tokens, game logic         — Phase 0 (built)
supabase        → migrations, edge functions, seed                   — Phase 1
docs            → the specs
design/ + *.jsx → prototype reference (read-only, do not ship)
```

## Getting started

```bash
npm install          # install all workspaces
npm test             # run shared game-logic unit tests
npm run typecheck    # type-check all workspaces
```

`packages/shared` is the only workspace with code so far. It holds the pure game engine
(XP -> level -> rank -> streak, ported from `proto-state.jsx`) and the brand tokens, with
unit tests proving parity with the spec in `docs/GAME-LOGIC.md`.

## Secrets

Copy `.env.example` to `.env` and fill in values as each phase needs them. Never commit
`.env` (it is gitignored). See `docs/SETUP-CHECKLIST.md` for what each key is and when it
is needed.
