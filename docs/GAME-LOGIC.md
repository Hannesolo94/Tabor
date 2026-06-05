# Game Logic (port exactly from `proto-state.jsx`)

Put this in `/packages/shared` so web, app, and Edge Functions agree. Pure functions, unit-test them.

## Constants
```
RANKS = ["Recruit","Initiate","Tempered","Forged","Crucible","Ascended","Supersonic Fit"]
RANK_LEVELS = [1, 6, 12, 20, 30, 42, 55]   // level at which each rank begins
XP_PER_LEVEL = 500
STAT_KEYS = ["STR","AGI","WIS","MANA"]
CLASSES = { Sentinel, Scribe, Crusader, Pilgrim }   // see BRAND.md for blurbs
```

## Derived values
```
levelFromXp(xp)        = floor(xp / XP_PER_LEVEL) + 1
rankIdxFromLevel(lvl)  = highest i where lvl >= RANK_LEVELS[i]
xpAtLevel(lvl)         = (lvl - 1) * XP_PER_LEVEL
rankProgress           = (xp - xpAtLevel(RANK_LEVELS[rankIdx])) /
                         (xpAtLevel(RANK_LEVELS[rankIdx+1]) - xpAtLevel(RANK_LEVELS[rankIdx]))
```
Completing a quest: `xp += quest.xp`, `stats[quest.stat] += round(quest.xp * 0.6)`.
When all 3 quests done and the day is not yet sealed: mark day sealed, `streak += 1`,
`best_streak = max(best_streak, streak)`, fire the **Day Sealed** ceremony.
When level crosses a `RANK_LEVELS` boundary, fire the **Rank Up** ceremony.

## Day rollover (the `daily-rollover` function)
For each day between `last_active+1` and yesterday that is not 'sealed':
- if `freezes > 0`: `freezes -= 1`, mark that day 'frozen' (streak survives)
- else: `streak = 0`, mark that day 'missed'
Then reset today's quests to not-done and set `last_active = today`.
(See `reconcile()` in `proto-state.jsx`.)

## Achievements (auto-unlock checks)
- first-blood: first quest completed
- week-one: streak >= 7
- tempered: rank index >= 2
- forged: rank index >= 3
- unbroken: streak >= 50
- (iron-will / scholar / brother: tie to workout/chapter/checkin counters)

## Class assignment
Assigned in onboarding from the user's answers (lean of goals/journey). Let the user pick,
but the System "names" it (the prototype lets the user choose on the Trials step).
