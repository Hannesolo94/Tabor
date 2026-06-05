// Derived math: xp -> level -> rank -> progress. Pure functions.
// Ported from proto-state.jsx (levelFromXp / rankIdxFromLevel / xpAtLevel and
// the rankProgress computation in useTabor).

import { RANK_LEVELS, RANKS, XP_PER_LEVEL } from "./constants.js";
import type { DerivedRank, GameState } from "./types.js";

/** Level for a given total xp. Level 1 is the floor. */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** Highest rank index whose RANK_LEVELS threshold the level has reached. */
export function rankIdxFromLevel(lvl: number): number {
  let r = 0;
  for (let i = 0; i < RANK_LEVELS.length; i++) {
    if (lvl >= RANK_LEVELS[i]!) r = i;
  }
  return r;
}

/** Total xp required to be exactly at the start of a level. */
export function xpAtLevel(lvl: number): number {
  return (lvl - 1) * XP_PER_LEVEL;
}

/**
 * Full derived read-model for a state: level, rank, progress to next rank,
 * and whether all of today's quests are done.
 */
export function deriveRank(s: GameState): DerivedRank {
  const level = levelFromXp(s.xp);
  const rankIdx = rankIdxFromLevel(level);
  const rankName = RANKS[rankIdx]!;
  const nextRankIdx = Math.min(rankIdx + 1, RANKS.length - 1);
  const nextRank = RANKS[nextRankIdx]!;
  const maxed = rankIdx === RANKS.length - 1;

  const base = xpAtLevel(RANK_LEVELS[rankIdx]!);
  const ceil = xpAtLevel(RANK_LEVELS[nextRankIdx]!);
  const rankProgress = maxed ? 1 : Math.max(0, Math.min(1, (s.xp - base) / (ceil - base)));

  const allDone = s.quests.length > 0 && s.quests.every((q) => q.done);

  return { level, rankIdx, rankName, nextRank, rankProgress, maxed, allDone };
}
