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
  if (opts.q && opts.q.trim().length >= 2) query = query.ilike("name", `%${opts.q.trim()}%`);
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
