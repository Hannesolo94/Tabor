// State factories. The prototype's makeFresh() returns *seeded demo data*
// (xp 6750, streak 47, etc.) for showing off the UI. For production we also need
// a genuinely empty new-player state. Both are provided here; both are pure and
// take `today` so they stay deterministic.

import { DEFAULT_QUESTS } from "./constants.js";
import { addDays } from "./dates.js";
import type { GameState } from "./types.js";

/** A clean state for a brand-new player (before onboarding fills in details). */
export function newPlayer(today: string): GameState {
  return {
    onboarded: false,
    name: "",
    cls: "Sentinel",
    denomination: "",
    journey: "",
    fitnessLevel: "",
    goals: [],
    equipment: "",
    xp: 0,
    stats: { STR: 0, AGI: 0, WIS: 0, MANA: 0 },
    streak: 0,
    bestStreak: 0,
    freezes: 0,
    quests: DEFAULT_QUESTS.map((q) => ({ ...q, done: false })),
    lastActive: today,
    history: {},
    chaptersRead: 0,
    workoutsLogged: 0,
    achievements: [],
  };
}

/**
 * Seeded demo state matching proto-state.jsx makeFresh(), for dev/storybook and
 * for tests that assert parity with the prototype.
 */
export function demoState(today: string): GameState {
  const history: GameState["history"] = {};
  for (let i = 1; i <= 34; i++) {
    const d = addDays(today, -i);
    history[d] = i === 5 || i === 17 ? "frozen" : i === 23 ? "missed" : "sealed";
  }
  return {
    onboarded: false,
    name: "",
    cls: "Sentinel",
    denomination: "Orthodox",
    journey: "Steady",
    fitnessLevel: "Intermediate",
    goals: [],
    equipment: "Minimal",
    xp: 6750,
    stats: { STR: 5200, AGI: 3400, WIS: 4600, MANA: 3900 },
    streak: 47,
    bestStreak: 63,
    freezes: 2,
    quests: DEFAULT_QUESTS.map((q) => ({ ...q, done: false })),
    lastActive: addDays(today, -1),
    history,
    chaptersRead: 12,
    workoutsLogged: 18,
    achievements: ["first-blood", "week-one", "tempered"],
  };
}
