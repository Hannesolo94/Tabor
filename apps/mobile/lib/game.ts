// Thin adapter over the canonical @tabor/shared game engine. Keeps the app's
// existing API (RANKS / levelFromXp / rankForLevel / levelProgress) but the math
// now comes from ONE shared source (web, app, and Edge all agree).
import { RANKS as SHARED_RANKS, levelFromXp as sharedLevelFromXp, rankIdxFromLevel, xpAtLevel } from "@tabor/shared";

export const RANKS = SHARED_RANKS;
export type Rank = (typeof RANKS)[number];

export const levelFromXp = sharedLevelFromXp;

export function rankForLevel(level: number): Rank {
  return RANKS[rankIdxFromLevel(level)] as Rank;
}

export function levelProgress(xp: number): { level: number; rank: Rank; into: number; need: number; pct: number } {
  const level = levelFromXp(xp);
  const base = xpAtLevel(level);
  const next = xpAtLevel(level + 1);
  const into = xp - base;
  const need = next - base;
  return { level, rank: rankForLevel(level), into, need, pct: need > 0 ? Math.min(1, into / need) : 1 };
}
