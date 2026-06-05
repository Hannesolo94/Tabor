// Game constants. Ported exactly from proto-state.jsx and docs/GAME-LOGIC.md.
// Do NOT change these values without updating the spec — web, app, and the
// daily-rollover Edge Function all depend on them agreeing.

import type { Achievement, ClassDef, ClassName, Quest, StatKey } from "./types.js";

export const RANKS = [
  "Recruit",
  "Initiate",
  "Tempered",
  "Forged",
  "Crucible",
  "Ascended",
  "Supersonic Fit",
] as const;

/** Level at which each rank begins (index-aligned with RANKS). */
export const RANK_LEVELS = [1, 6, 12, 20, 30, 42, 55] as const;

export const XP_PER_LEVEL = 500;

/** Fraction of a quest's xp that is added to its governing stat. */
export const STAT_GAIN_RATIO = 0.6;

export const STAT_KEYS: readonly StatKey[] = ["STR", "AGI", "WIS", "MANA"];

export const STAT_NAMES: Record<StatKey, string> = {
  STR: "Strength",
  AGI: "Agility",
  WIS: "Wisdom",
  MANA: "Spirit",
};

export const CLASSES: Record<ClassName, ClassDef> = {
  Sentinel: { tag: "The guardian", blurb: "Balanced and steady. You hold the line.", lean: "Even" },
  Scribe: { tag: "The student", blurb: "You lean into the Word and Wisdom.", lean: "WIS" },
  Crusader: { tag: "The fighter", blurb: "You lean into the iron and Strength.", lean: "STR" },
  Pilgrim: { tag: "The seeker", blurb: "New to the climb. Guided gently.", lean: "AGI" },
};

export const DEFAULT_QUESTS: readonly Quest[] = [
  { id: "scout", pillar: "Scripture Raid", title: "Scout the Chapter", sub: "Read John 1:1 to 1:14, then a short drill.", stat: "WIS", xp: 120, done: false, tab: "scripture" },
  { id: "iron", pillar: "Fitness Guild", title: "Iron Body", sub: "7,500 steps or a 20-minute workout.", stat: "STR", xp: 140, done: false, tab: "body" },
  { id: "line", pillar: "Brotherhood", title: "Hold the Line", sub: "Check in with your guild. One honest line.", stat: "MANA", xp: 90, done: false, tab: "guild" },
];

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "first-blood", name: "First Light", desc: "Complete your first quest.", icon: "✦" },
  { id: "week-one", name: "Seven Days", desc: "Hold a 7 day streak.", icon: "◇" },
  { id: "tempered", name: "Tempered", desc: "Reach the rank of Tempered.", icon: "▲" },
  { id: "forged", name: "Forged", desc: "Reach the rank of Forged.", icon: "✝" },
  { id: "iron-will", name: "Iron Will", desc: "Log 25 workouts.", icon: "⚔" },
  { id: "scholar", name: "The Scholar", desc: "Read 50 chapters.", icon: "✚" },
  { id: "unbroken", name: "Unbroken", desc: "Hold a 50 day streak.", icon: "❖" },
  { id: "brother", name: "Brother's Keeper", desc: "Check in 30 days running.", icon: "⌂" },
];

/** The System voice. Terse, ceremonial, no em dashes. */
export const SYSTEM = {
  dawn: (cls: string, rank: string) => `Dawn, ${cls}. Three trials stand between you and ${rank}.`,
  questDone: {
    scout: "The chapter is scouted. Wisdom rises.",
    iron: "Iron logged. The body is tempered.",
    line: "You did not climb alone today.",
  } as Record<string, string>,
  allDone: "The day is held. Rest, Son of Fire. Dawn brings the next ascent.",
  streakRisk: "Your streak still stands. Do not let it fall tonight.",
} as const;
