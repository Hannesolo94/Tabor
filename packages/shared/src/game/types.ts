// Core domain types for the TABOR game engine.
// Ported from proto-state.jsx. These types are shared by web, mobile, and Edge Functions.

export type StatKey = "STR" | "AGI" | "WIS" | "MANA";

export type ClassName = "Sentinel" | "Scribe" | "Crusader" | "Pilgrim";

/** Status of a single day in the streak history. */
export type DayStatus = "sealed" | "frozen" | "missed";

export interface Quest {
  id: string;
  pillar: string;
  title: string;
  sub: string;
  stat: StatKey;
  xp: number;
  done: boolean;
  tab: string;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface ClassDef {
  tag: string;
  blurb: string;
  lean: string;
}

export type Stats = Record<StatKey, number>;

/** A map of ISO date string (YYYY-MM-DD) to that day's status. */
export type History = Record<string, DayStatus>;

/**
 * The persisted player state. This is the serializable slice that lives in
 * Supabase / local storage. UI-only fields from the prototype are kept so the
 * port stays faithful, but the game engine only mutates the gameplay fields.
 */
export interface GameState {
  onboarded: boolean;
  name: string;
  cls: ClassName;
  denomination: string;
  journey: string;
  fitnessLevel: string;
  goals: string[];
  equipment: string;

  xp: number;
  stats: Stats;
  streak: number;
  bestStreak: number;
  freezes: number;

  quests: Quest[];
  lastActive: string;
  history: History;

  chaptersRead: number;
  workoutsLogged: number;

  achievements: string[];
}

/** Values derived from xp/level. Pure read-model, never persisted. */
export interface DerivedRank {
  level: number;
  rankIdx: number;
  rankName: string;
  nextRank: string;
  rankProgress: number;
  maxed: boolean;
  allDone: boolean;
}
