// Pure state transitions for the TABOR game engine.
// Ported from the action handlers + reconcile() in proto-state.jsx, but rewritten
// as pure (state) => state functions with no React / localStorage dependency.
// `today` is always injected so the logic is deterministic and unit-testable.

import { STAT_GAIN_RATIO } from "./constants.js";
import { addDays } from "./dates.js";
import { levelFromXp, rankIdxFromLevel } from "./derive.js";
import type { GameState } from "./types.js";

/**
 * Auto-unlock achievements derivable purely from streak/rank.
 * Counter-based ones (iron-will, scholar, brother) are unlocked elsewhere.
 */
export function autoUnlock(s: GameState): string[] {
  const have = new Set(s.achievements);
  const lvl = levelFromXp(s.xp);
  const ri = rankIdxFromLevel(lvl);
  if (s.streak >= 7) have.add("week-one");
  if (s.streak >= 50) have.add("unbroken");
  if (ri >= 2) have.add("tempered");
  if (ri >= 3) have.add("forged");
  return [...have];
}

export interface CompleteQuestResult {
  state: GameState;
  /** True when this completion sealed the day (all three quests done). */
  daySealed: boolean;
  /** True when the new xp crossed into a higher rank. */
  rankedUp: boolean;
}

/**
 * Complete a quest. Adds xp, raises the governing stat, and if it was the last
 * undone quest seals the day and advances the streak. Idempotent: completing an
 * already-done quest is a no-op.
 */
export function completeQuest(s: GameState, id: string, today: string): CompleteQuestResult {
  const q = s.quests.find((x) => x.id === id);
  if (!q || q.done) return { state: s, daySealed: false, rankedUp: false };

  const rankBefore = rankIdxFromLevel(levelFromXp(s.xp));

  const quests = s.quests.map((x) => (x.id === id ? { ...x, done: true } : x));
  const stats = { ...s.stats, [q.stat]: s.stats[q.stat] + Math.round(q.xp * STAT_GAIN_RATIO) };
  const xp = s.xp + q.xp;

  let streak = s.streak;
  let bestStreak = s.bestStreak;
  const history = { ...s.history };

  const nowAll = quests.every((x) => x.done);
  let daySealed = false;
  if (nowAll && history[today] !== "sealed") {
    history[today] = "sealed";
    streak = s.streak + 1;
    bestStreak = Math.max(s.bestStreak, streak);
    daySealed = true;
  }

  const achievements = [...s.achievements];
  if (!achievements.includes("first-blood")) achievements.push("first-blood");

  let next: GameState = { ...s, quests, stats, xp, streak, bestStreak, history, achievements };
  next = { ...next, achievements: autoUnlock(next) };

  const rankedUp = rankIdxFromLevel(levelFromXp(xp)) > rankBefore;
  return { state: next, daySealed, rankedUp };
}

/** Reset today's quests to not-done (used by day rollover). */
export function resetDay(s: GameState): GameState {
  return { ...s, quests: s.quests.map((q) => ({ ...q, done: false })) };
}

/** Spend a freeze to protect today's streak. No-op if none left. */
export function useFreeze(s: GameState, today: string): GameState {
  if (s.freezes <= 0) return s;
  const history = { ...s.history, [today]: "frozen" as const };
  return { ...s, freezes: s.freezes - 1, history };
}

/**
 * Day rollover reconciliation. For every day between lastActive+1 and yesterday
 * that was not sealed: spend a freeze if available (day survives as "frozen"),
 * otherwise break the streak and mark the day "missed". Then reset today's
 * quests and set lastActive = today. Ported from reconcile() in proto-state.jsx.
 */
export function reconcile(s: GameState, today: string): GameState {
  if (s.lastActive === today) return s;

  let streak = s.streak;
  let freezes = s.freezes;
  const history = { ...s.history };

  if (s.lastActive) {
    const yesterday = addDays(today, -1);
    let cur = addDays(s.lastActive, 1);
    let guard = 0;
    while (cur <= yesterday && guard < 400) {
      if (history[cur] !== "sealed") {
        if (freezes > 0) {
          freezes -= 1;
          history[cur] = "frozen";
        } else {
          streak = 0;
          history[cur] = "missed";
        }
      }
      cur = addDays(cur, 1);
      guard++;
    }
  }

  return {
    ...s,
    streak,
    freezes,
    history,
    lastActive: today,
    quests: s.quests.map((q) => ({ ...q, done: false })),
  };
}

/** Log a workout: prepend to history and bump the counter. */
export function logWorkout(s: GameState): GameState {
  return { ...s, workoutsLogged: s.workoutsLogged + 1 };
}
