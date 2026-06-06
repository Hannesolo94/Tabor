// Minimal game math for the first draft. NOTE: the canonical engine lives in
// packages/shared (@tabor/shared). Wire that in once the app runs so web, app,
// and Edge Functions never disagree. Kept self-contained here to guarantee the
// draft builds without monorepo symlink config.

export const RANKS = ["Recruit", "Initiate", "Tempered", "Forged", "Crucible", "Ascended", "Supersonic Fit"] as const;
export type Rank = (typeof RANKS)[number];

/** Cumulative XP needed to reach a given level (gentle curve). */
export function xpForLevel(level: number): number {
  return Math.round(50 * level * (level - 1)); // L1=0, L2=100, L3=300, L4=600...
}

export function levelFromXp(xp: number): number {
  let lvl = 1;
  while (xpForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
}

export function rankForLevel(level: number): Rank {
  // 7 ranks across the climb
  const idx = Math.min(RANKS.length - 1, Math.floor((level - 1) / 8));
  return RANKS[idx];
}

export function levelProgress(xp: number): { level: number; rank: Rank; into: number; need: number; pct: number } {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const into = xp - base;
  const need = next - base;
  return { level, rank: rankForLevel(level), into, need, pct: need > 0 ? Math.min(1, into / need) : 1 };
}
