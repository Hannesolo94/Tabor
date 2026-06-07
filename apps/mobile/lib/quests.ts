// Real daily-quest persistence against the Phase-1 tables (quests, day_history,
// profiles.xp/streak). Self-contained draft logic; swap the XP/streak math for
// @tabor/shared once it's wired into Metro.
import { supabase } from "./supabase";

export interface Quest {
  id: string;
  quest_key: string;
  pillar: string;
  title: string;
  sub: string | null;
  xp: number;
  done: boolean;
}

const DAILY = [
  { quest_key: "word", pillar: "SCRIPTURE RAID", title: "Read today's passage", sub: "Take ground in the Word", stat: "spirit", xp: 30, goal: 1 },
  { quest_key: "body", pillar: "FITNESS GUILD", title: "Complete a training set", sub: "Train the temple", stat: "body", xp: 40, goal: 1 },
  { quest_key: "brother", pillar: "BROTHERHOOD", title: "Check in with the guild", sub: "No man climbs alone", stat: "soul", xp: 20, goal: 1 },
];

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Load (or seed) today's quests for a user. */
export async function loadToday(userId: string): Promise<Quest[]> {
  const day = todayKey();
  const { data } = await supabase.from("quests").select("id, quest_key, pillar, title, sub, xp, done").eq("user_id", userId).eq("day", day);
  if (data && data.length) return data as Quest[];
  const rows = DAILY.map((q) => ({ ...q, user_id: userId, day, done: false, progress: 0 }));
  const ins = await supabase.from("quests").insert(rows).select("id, quest_key, pillar, title, sub, xp, done");
  return (ins.data as Quest[]) ?? [];
}

// quest pillar -> RPG stat (data-model: STR/AGI/WIS/MANA)
const STAT_BY_KEY: Record<string, string> = { body: "STR", word: "WIS", brother: "MANA" };

/** Toggle a quest done/undone and atomically award/remove its XP + stat. */
export async function toggleQuest(userId: string, quest: Quest, done: boolean): Promise<void> {
  await supabase.from("quests").update({ done, progress: done ? 1 : 0 }).eq("id", quest.id);
  const stat = STAT_BY_KEY[quest.quest_key] ?? null;
  await supabase.rpc("apply_quest_delta", { p_xp: done ? quest.xp : -quest.xp, p_stat: stat, p_stat_delta: stat ? (done ? 1 : -1) : 0 });
}

/** Seal the day when all quests are done. Idempotent per day; bumps streak once. */
export async function sealDay(userId: string): Promise<void> {
  const day = todayKey();
  await supabase.from("day_history").upsert({ user_id: userId, day, status: "sealed" });
  const { data } = await supabase.from("profiles").select("streak, best_streak, last_active").eq("user_id", userId).maybeSingle();
  const last = data?.last_active ? String(data.last_active).slice(0, 10) : null;
  if (last === day) return; // already counted today
  const streak = (Number(data?.streak) || 0) + 1;
  const best = Math.max(Number(data?.best_streak) || 0, streak);
  await supabase.from("profiles").update({ streak, best_streak: best, last_active: new Date().toISOString() }).eq("user_id", userId);
}
