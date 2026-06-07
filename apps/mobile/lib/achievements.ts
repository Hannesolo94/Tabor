import { supabase } from "./supabase";

export interface Honor { id: string; name: string; desc: string; test: (s: Snapshot) => boolean }
interface Snapshot { xp: number; bestStreak: number; sealedDays: number; workouts: number; prayers: number }

// The honor catalog. Auto-unlocks when its test passes against the user's snapshot.
export const HONORS: Honor[] = [
  { id: "first-flame", name: "First Flame", desc: "Seal your first day.", test: (s) => s.sealedDays >= 1 },
  { id: "kindling", name: "Kindling", desc: "Hold a 3 day streak.", test: (s) => s.bestStreak >= 3 },
  { id: "tempered", name: "Tempered", desc: "Hold a 7 day streak.", test: (s) => s.bestStreak >= 7 },
  { id: "forged", name: "Forged", desc: "Hold a 30 day streak.", test: (s) => s.bestStreak >= 30 },
  { id: "iron-initiate", name: "Iron Initiate", desc: "Log your first workout.", test: (s) => s.workouts >= 1 },
  { id: "iron-will", name: "Iron Will", desc: "Log 10 workouts.", test: (s) => s.workouts >= 10 },
  { id: "first-knee", name: "First Knee", desc: "Record your first prayer.", test: (s) => s.prayers >= 1 },
  { id: "intercessor", name: "Intercessor", desc: "Record 10 prayers.", test: (s) => s.prayers >= 10 },
  { id: "ascending", name: "Ascending", desc: "Reach 1000 XP.", test: (s) => s.xp >= 1000 },
];

async function snapshot(userId: string): Promise<Snapshot> {
  const [{ data: p }, days, workouts, prayers] = await Promise.all([
    supabase.from("profiles").select("xp, best_streak").eq("user_id", userId).maybeSingle(),
    supabase.from("day_history").select("day", { count: "exact", head: true }).eq("user_id", userId).eq("status", "sealed"),
    supabase.from("workouts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("prayers").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  return { xp: p?.xp ?? 0, bestStreak: p?.best_streak ?? 0, sealedDays: days.count ?? 0, workouts: workouts.count ?? 0, prayers: prayers.count ?? 0 };
}

export interface HonorState extends Honor { unlocked: boolean; unlockedAt: string | null }

/** Evaluate the catalog, unlock newly earned honors, return merged state. */
export async function loadHonors(userId: string): Promise<HonorState[]> {
  const snap = await snapshot(userId);
  const { data: rows } = await supabase.from("achievements").select("achievement_id, unlocked_at").eq("user_id", userId);
  const have = new Map((rows ?? []).map((r) => [r.achievement_id, r.unlocked_at as string]));
  const toUnlock = HONORS.filter((h) => h.test(snap) && !have.has(h.id)).map((h) => ({ user_id: userId, achievement_id: h.id }));
  if (toUnlock.length) {
    await supabase.from("achievements").upsert(toUnlock, { onConflict: "user_id,achievement_id" });
    for (const u of toUnlock) have.set(u.achievement_id, new Date().toISOString());
  }
  return HONORS.map((h) => ({ ...h, unlocked: have.has(h.id), unlockedAt: have.get(h.id) ?? null }));
}
