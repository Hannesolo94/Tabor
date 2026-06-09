// Fitness engine: exercise library queries + tailored program generation against
// the imported exercise DB, plus user routines (generated + custom).
import { supabase } from "./supabase";

export interface Exercise {
  id: string; name: string; level: string | null; equipment: string | null; category: string | null;
  primary_muscles: string[]; secondary_muscles: string[]; instructions: string[]; image_url: string | null; video_url: string | null; mechanic: string | null; force: string | null;
}
export interface Routine { id: string; name: string; focus: string | null; generated: boolean }
export interface RoutineExercise { id: string; exercise_id: string; sets: number; reps: string; rest: number; sort: number; exercise?: Exercise }

// Browseable muscle groups -> dataset muscle names
export const MUSCLE_GROUPS: { label: string; muscles: string[] }[] = [
  { label: "Chest", muscles: ["chest"] },
  { label: "Back", muscles: ["lats", "middle back", "lower back", "traps"] },
  { label: "Shoulders", muscles: ["shoulders"] },
  { label: "Arms", muscles: ["biceps", "triceps", "forearms"] },
  { label: "Legs", muscles: ["quadriceps", "hamstrings", "glutes", "calves", "abductors", "adductors"] },
  { label: "Core", muscles: ["abdominals"] },
];
export const EQUIPMENT = ["body only", "dumbbell", "barbell", "kettlebells", "cable", "machine", "bands", "other"];

export async function listExercises(opts: { q?: string; muscles?: string[]; equipment?: string }): Promise<Exercise[]> {
  let query = supabase.from("exercises").select("*").order("name", { ascending: true }).limit(120);
  if (opts.q && opts.q.trim().length >= 2) {
    // treat spaces/hyphens as flexible so "push up", "push-up" and "pushup" all match
    // "Push-Up", "Pushups", etc. (the dataset mixes hyphens, spaces, and joined words)
    const pattern = "%" + opts.q.trim().replace(/[\s-]+/g, "%") + "%";
    query = query.ilike("name", pattern);
  }
  if (opts.muscles && opts.muscles.length) query = query.overlaps("primary_muscles", opts.muscles);
  if (opts.equipment) query = query.eq("equipment", opts.equipment);
  const { data } = await query;
  return (data as Exercise[]) ?? [];
}

export async function getExercise(id: string): Promise<Exercise | null> {
  const { data } = await supabase.from("exercises").select("*").eq("id", id).maybeSingle();
  return (data as Exercise) ?? null;
}

// ---- program generation ----
const LEVELS_FOR: Record<string, string[]> = {
  beginner: ["beginner"],
  returning: ["beginner", "intermediate"],
  consistent: ["beginner", "intermediate", "expert"],
  athlete: ["intermediate", "expert"],
};
function equipmentFilter(equip?: string | null): string[] {
  if (equip === "none" || equip === "body only") return ["body only", "other"];
  if (equip === "dumbbells" || equip === "home") return ["body only", "dumbbell", "kettlebells", "bands", "other"];
  return EQUIPMENT; // full gym
}
function setsRepsFor(goal?: string | null): { sets: number; reps: string; rest: number } {
  switch (goal) {
    case "strength": return { sets: 5, reps: "5", rest: 150 };
    case "muscle": return { sets: 4, reps: "8-12", rest: 75 };
    case "fatloss": return { sets: 3, reps: "12-15", rest: 45 };
    case "endurance": return { sets: 3, reps: "15-20", rest: 30 };
    default: return { sets: 3, reps: "10-12", rest: 60 };
  }
}
// split by days/week
function splitFor(days: number): { focus: string; groups: string[] }[] {
  if (days <= 3) return Array.from({ length: Math.max(2, days) }, () => ({ focus: "Full Body", groups: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"] }));
  if (days === 4) return [
    { focus: "Upper", groups: ["Chest", "Back", "Shoulders", "Arms"] },
    { focus: "Lower", groups: ["Legs", "Core"] },
    { focus: "Upper", groups: ["Back", "Chest", "Shoulders", "Arms"] },
    { focus: "Lower", groups: ["Legs", "Core"] },
  ];
  return [
    { focus: "Push", groups: ["Chest", "Shoulders", "Arms"] },
    { focus: "Pull", groups: ["Back", "Arms"] },
    { focus: "Legs", groups: ["Legs", "Core"] },
    { focus: "Push", groups: ["Chest", "Shoulders", "Arms"] },
    { focus: "Pull", groups: ["Back", "Arms"] },
    { focus: "Legs", groups: ["Legs", "Core"] },
  ].slice(0, days);
}

interface PoolEx { id: string; primary_muscles: string[]; category: string | null }

/** Generate a tailored library of routines (day split + themed extras, 10+) and save it. */
export async function generateProgram(userId: string, profile: { fitness_level?: string | null; equipment?: string | null; goals?: string | null; days?: number | null }): Promise<number> {
  const level = String(profile.fitness_level ?? "beginner");
  const levels = LEVELS_FOR[level] ?? LEVELS_FOR.beginner;
  const equip = equipmentFilter(profile.equipment);
  const sr = setsRepsFor(profile.goals);
  const days = Math.min(6, Math.max(2, Number(profile.days ?? 3)));

  // one candidate-pool query, assemble in memory
  const { data } = await supabase.from("exercises").select("id, primary_muscles, category").in("equipment", equip).in("level", levels).limit(600);
  const pool = (data as PoolEx[]) ?? [];

  function pick(groups: string[], rot: number, category?: string, count = 6): string[] {
    const muscles = groups.flatMap((g) => MUSCLE_GROUPS.find((m) => m.label === g)?.muscles ?? []);
    let filtered = pool.filter((e) => (category ? e.category === category : true) && (e.primary_muscles || []).some((pm) => muscles.includes(pm)));
    if (filtered.length) { const s = (rot * 3) % filtered.length; filtered = filtered.slice(s).concat(filtered.slice(0, s)); }
    const chosen: string[] = [];
    for (const e of filtered) { if (chosen.length >= count) break; if (!chosen.includes(e.id)) chosen.push(e.id); }
    return chosen;
  }

  await supabase.from("routines").delete().eq("user_id", userId).eq("generated", true);

  const plan: { name: string; focus: string; groups: string[]; category?: string; count?: number }[] = [];
  splitFor(days).forEach((d, i) => plan.push({ name: `Day ${i + 1} · ${d.focus}`, focus: d.focus, groups: d.groups }));
  // themed extras so the library is always rich (10+ total)
  plan.push({ name: "Full Body Forge", focus: "Full Body", groups: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"] });
  plan.push({ name: "Upper Power", focus: "Upper", groups: ["Chest", "Back", "Shoulders", "Arms"] });
  plan.push({ name: "Lower Power", focus: "Lower", groups: ["Legs", "Core"] });
  plan.push({ name: "Push Day", focus: "Push", groups: ["Chest", "Shoulders", "Arms"] });
  plan.push({ name: "Pull Day", focus: "Pull", groups: ["Back", "Arms"] });
  plan.push({ name: "Core Crucible", focus: "Core", groups: ["Core"], count: 5 });
  plan.push({ name: "Mobility & Recovery", focus: "Mobility", groups: ["Legs", "Back", "Shoulders"], category: "stretching" });

  let made = 0;
  for (let i = 0; i < plan.length; i++) {
    const p = plan[i];
    const ex = pick(p.groups, i, p.category, p.count ?? 6);
    if (!ex.length) continue;
    const { data: r } = await supabase.from("routines").insert({ user_id: userId, name: p.name, focus: p.focus, generated: true, sort: i }).select("id").single();
    if (r?.id) {
      await supabase.from("routine_exercises").insert(ex.map((eid, j) => ({ routine_id: r.id, exercise_id: eid, sort: j, sets: sr.sets, reps: p.category === "stretching" ? "30s" : sr.reps, rest: p.category === "stretching" ? 15 : sr.rest })));
      made++;
    }
  }
  return made;
}

export async function getRoutines(userId: string): Promise<Routine[]> {
  const { data } = await supabase.from("routines").select("id, name, focus, generated").eq("user_id", userId).order("sort", { ascending: true });
  return (data as Routine[]) ?? [];
}
export async function getRoutineExercises(routineId: string): Promise<RoutineExercise[]> {
  const { data } = await supabase.from("routine_exercises").select("id, exercise_id, sets, reps, rest, sort, exercise:exercises(*)").eq("routine_id", routineId).order("sort", { ascending: true });
  return (data as unknown as RoutineExercise[]) ?? [];
}
export async function createRoutine(userId: string, name: string): Promise<string | null> {
  const { data } = await supabase.from("routines").insert({ user_id: userId, name, focus: "Custom", generated: false }).select("id").single();
  return data?.id ?? null;
}
export async function addExerciseToRoutine(routineId: string, exerciseId: string): Promise<void> {
  const { count } = await supabase.from("routine_exercises").select("id", { count: "exact", head: true }).eq("routine_id", routineId);
  await supabase.from("routine_exercises").insert({ routine_id: routineId, exercise_id: exerciseId, sort: count ?? 0, sets: 3, reps: "10-12", rest: 60 });
}
export async function deleteRoutine(routineId: string): Promise<void> {
  await supabase.from("routines").delete().eq("id", routineId);
}
export async function removeExerciseFromRoutine(routineExerciseId: string): Promise<void> {
  await supabase.from("routine_exercises").delete().eq("id", routineExerciseId);
}
export async function moveRoutineExercises(orderedIds: string[]): Promise<void> {
  await Promise.all(orderedIds.map((id, i) => supabase.from("routine_exercises").update({ sort: i }).eq("id", id)));
}
export async function renameRoutine(routineId: string, name: string): Promise<void> {
  await supabase.from("routines").update({ name }).eq("id", routineId);
}
/** Copy a routine and all its exercises into a new custom routine. */
export async function duplicateRoutine(userId: string, routineId: string): Promise<string | null> {
  const { data: orig } = await supabase.from("routines").select("name, focus").eq("id", routineId).maybeSingle();
  const { data: nr } = await supabase.from("routines").insert({ user_id: userId, name: `${orig?.name ?? "Routine"} copy`, focus: orig?.focus ?? "Custom", generated: false }).select("id").single();
  if (!nr) return null;
  const ex = await getRoutineExercises(routineId);
  if (ex.length) await supabase.from("routine_exercises").insert(ex.map((e, j) => ({ routine_id: nr.id, exercise_id: e.exercise_id, sets: e.sets, reps: e.reps, rest: e.rest, sort: j })));
  return nr.id;
}
/** Persist a new order for a set of routines (ids in the desired order). */
export async function moveRoutine(orderedIds: string[]): Promise<void> {
  await Promise.all(orderedIds.map((id, i) => supabase.from("routines").update({ sort: i }).eq("id", id)));
}

export interface WorkoutRow { id: string; name: string; mins: number | null; day: string; created_at: string }
export interface PR { lift: string; value: number }

export async function getWorkouts(userId: string): Promise<WorkoutRow[]> {
  const { data } = await supabase.from("workouts").select("id, name, mins, day, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(60);
  return data ?? [];
}
export async function getPRs(userId: string): Promise<PR[]> {
  const { data } = await supabase.from("personal_records").select("lift, value").eq("user_id", userId).order("lift");
  return (data as PR[]) ?? [];
}
export async function setPR(userId: string, lift: string, value: number): Promise<void> {
  await supabase.from("personal_records").upsert({ user_id: userId, lift, value }, { onConflict: "user_id,lift" });
}
export async function deletePR(userId: string, lift: string): Promise<void> {
  await supabase.from("personal_records").delete().eq("user_id", userId).eq("lift", lift);
}

export interface TabataConfig { prepare: number; work: number; rest: number; cycles: number; sets: number; restBetween: number; cooldown: number }
export interface TabataPreset { id: string; name: string; config: TabataConfig; moves: string[] }
export const DEFAULT_TABATA: TabataConfig = { prepare: 10, work: 20, rest: 10, cycles: 8, sets: 1, restBetween: 60, cooldown: 0 };
export async function getTabataPresets(userId: string): Promise<TabataPreset[]> {
  const { data } = await supabase.from("tabata_presets").select("id, name, config, moves, work, rest, rounds").eq("user_id", userId).order("name");
  return (data ?? []).map((r) => ({ id: r.id as string, name: r.name as string, moves: (r.moves as string[]) ?? [], config: (r.config as TabataConfig) ?? { ...DEFAULT_TABATA, work: Number(r.work) || 20, rest: Number(r.rest) || 10, cycles: Number(r.rounds) || 8, sets: 1 } }));
}
export async function saveTabataPreset(userId: string, name: string, config: TabataConfig, moves: string[]): Promise<void> {
  await supabase.from("tabata_presets").insert({ user_id: userId, name, work: config.work, rest: config.rest, rounds: config.cycles, config, moves });
}
export async function deleteTabataPreset(id: string): Promise<void> {
  await supabase.from("tabata_presets").delete().eq("id", id);
}

// ---- Progress tracking: per-set logging + chart series ----
export type InputKind = "reps_weight" | "reps" | "time_distance" | "time";
/** What to ask the user to log for an exercise: weighted strength, bodyweight reps,
 *  cardio (time + distance), or a timed hold. */
export function inputKind(category?: string | null, equipment?: string | null): InputKind {
  const cat = (category || "").toLowerCase();
  const eq = (equipment || "").toLowerCase();
  if (cat === "cardio") return "time_distance";
  if (cat === "stretching") return "time";
  if (eq === "body only" || eq === "bands" || eq === "foam roll") return "reps";
  return "reps_weight";
}
export interface SetEntry { exercise_id: string; exercise_name: string; set_index: number; reps: number; weight: number; duration_sec?: number; distance_m?: number }
export interface DayPoint { day: string; value: number }
const dayAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

export async function logWorkout(userId: string, name: string, mins: number, sets: SetEntry[], day: string): Promise<void> {
  const done = sets.filter((s) => s.reps > 0 || (s.duration_sec ?? 0) > 0 || (s.distance_m ?? 0) > 0);
  const volume = done.reduce((a, s) => a + (s.reps || 0) * (s.weight || 0), 0);
  const { data: w } = await supabase.from("workouts").insert({ user_id: userId, name, mins, day, meta: { sets: done.length, volume } }).select("id").maybeSingle();
  if (!done.length) return;
  await supabase.from("set_logs").insert(done.map((s) => ({ user_id: userId, workout_id: w?.id, exercise_id: s.exercise_id, exercise_name: s.exercise_name, set_index: s.set_index, reps: s.reps || null, weight: s.weight || null, duration_sec: s.duration_sec ?? null, distance_m: s.distance_m ?? null, day })));
  // bump PRs with best estimated 1RM (Epley) per lift this session
  const best: Record<string, number> = {};
  for (const s of done) { if (!s.weight) continue; const e = Math.round(s.weight * (1 + s.reps / 30)); if (e > (best[s.exercise_name] || 0)) best[s.exercise_name] = e; }
  for (const [lift, value] of Object.entries(best)) {
    const { data: cur } = await supabase.from("personal_records").select("value").eq("user_id", userId).eq("lift", lift).maybeSingle();
    if (!cur || value > Number(cur.value)) await supabase.from("personal_records").upsert({ user_id: userId, lift, value }, { onConflict: "user_id,lift" });
  }
}

export async function getVolumeByDay(userId: string, days = 30): Promise<DayPoint[]> {
  const { data } = await supabase.from("set_logs").select("day, reps, weight").eq("user_id", userId).gte("day", dayAgo(days));
  const map: Record<string, number> = {};
  for (const r of data ?? []) map[r.day] = (map[r.day] || 0) + (r.reps || 0) * (Number(r.weight) || 0);
  return Object.entries(map).map(([day, value]) => ({ day, value })).sort((a, b) => a.day.localeCompare(b.day));
}
export async function getTrackedLifts(userId: string): Promise<string[]> {
  const { data } = await supabase.from("set_logs").select("exercise_name").eq("user_id", userId);
  return [...new Set((data ?? []).map((r) => r.exercise_name).filter(Boolean) as string[])];
}
export async function getLiftProgress(userId: string, lift: string): Promise<DayPoint[]> {
  const { data } = await supabase.from("set_logs").select("day, reps, weight").eq("user_id", userId).eq("exercise_name", lift);
  const map: Record<string, number> = {};
  for (const r of data ?? []) { const e = (Number(r.weight) || 0) * (1 + (r.reps || 0) / 30); if (e > (map[r.day] || 0)) map[r.day] = e; }
  return Object.entries(map).map(([day, value]) => ({ day, value: Math.round(value) })).sort((a, b) => a.day.localeCompare(b.day));
}
export async function logBodyweight(userId: string, weight: number, day: string): Promise<void> {
  await supabase.from("body_metrics").upsert({ user_id: userId, day, weight }, { onConflict: "user_id,day" });
}
export async function getBodyweightSeries(userId: string, days = 90): Promise<DayPoint[]> {
  const { data } = await supabase.from("body_metrics").select("day, weight").eq("user_id", userId).gte("day", dayAgo(days)).order("day");
  return (data ?? []).map((r) => ({ day: r.day, value: Number(r.weight) || 0 }));
}
