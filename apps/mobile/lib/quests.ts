// Daily-quest persistence + the INITIAL (rule-based) personalized quest engine.
// Designed to run solo for 6+ months before any AI layer: deep reading plan,
// equipment-tiered movement pools, baseline-anchored scaling, level-driven
// progression. Quests escalate as the user levels up ("progress pushes it").
import { supabase } from "./supabase";
import { levelFromXp } from "./game";
import { generateDisciplineQuests, traditionOf, type Tradition } from "./disciplines";
import { liturgicalContext } from "./liturgical";

// core quests gate the day-seal; everything else is a bonus discipline
export const CORE_KEYS = ["word", "body", "brother"];

export interface Quest {
  id: string;
  quest_key: string;
  pillar: string;
  title: string;
  sub: string | null;
  xp: number;
  stat?: string | null;
  done: boolean;
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
function dayIndex(d = new Date()): number {
  return Math.floor(d.getTime() / 86_400_000);
}

// ---------- content: scripture reading plan (sequential, ~238 days) ----------
const PLAN_SEQ: [string, number, number][] = [
  ["John", 1, 21], ["James", 1, 5], ["Mark", 1, 16], ["Proverbs", 1, 31],
  ["Philippians", 1, 4], ["Ephesians", 1, 6], ["1 Peter", 1, 5], ["Romans", 1, 16],
  ["Matthew", 1, 28], ["1 Corinthians", 1, 16], ["Psalms", 1, 41], ["Genesis", 1, 25],
  ["Luke", 1, 24],
];
// Deuterocanon — added to the reading journey for Catholic + Orthodox brothers so
// their Bible is never "missing books." (Orthodox also keep a few more; covered later.)
const DEUTERO: [string, number, number][] = [
  ["Tobit", 1, 14], ["Judith", 1, 16], ["Wisdom", 1, 19], ["Sirach", 1, 51],
  ["Baruch", 1, 6], ["1 Maccabees", 1, 16], ["2 Maccabees", 1, 15],
];
function buildPlan(trad: Tradition): string[] {
  const out: string[] = [];
  for (const [book, a, b] of PLAN_SEQ) for (let i = a; i <= b; i++) out.push(`${book} ${i}`);
  if (trad === "catholic" || trad === "orthodox") {
    for (const [book, a, b] of DEUTERO) for (let i = a; i <= b; i++) out.push(`${book} ${i}`);
  }
  return out;
}

// ---------- content: brotherhood actions ----------
const BROTHER = [
  "Check in with your guild", "Encourage a brother in the war-room", "Share one win in the guild chat",
  "Pray for a brother by name", "Welcome someone new to the brotherhood", "Post a verse that carried you today",
  "Ask a brother how his training is going", "Confess one struggle and ask for prayer",
  "Reply to someone's post and spot them", "Invite a friend to the brotherhood",
  "Thank God publicly for one thing", "Challenge a brother to tomorrow's quest",
  "Share your favourite lift or exercise", "Salute the top 3 on the leaderboard",
  "Offer to keep a brother accountable this week", "Drop a word of strength for the guild",
];

// ---------- fitness engine ----------
// Two growth factors, both bounded, and every output hard-capped to a human-
// realistic ceiling so the engine can never prescribe absurd volume (validated
// by simulation across 6 months of diverse users).
//   vol  : daily rep-TOTAL multiplier for bodyweight movements (2.0 -> 4.0)
//   prog : per-set reps / distance / time multiplier (1.0 -> 1.8)
interface Baseline { pushups?: number; squats?: number; pullups?: number; bench_kg?: number; bench_reps?: number; db_kg?: number }
interface Ctx { vol: number; prog: number; goalMod: number; ageF: number; b: Baseline }
type Move = { key: string; tags?: string[]; render: (c: Ctx) => string };

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const r5 = (n: number) => Math.round(n / 5) * 5;
const km = (n: number) => Math.round(n * 2) / 2;
const repsSet = (base: number, c: Ctx) => clamp(Math.round(base * c.prog * c.goalMod), 6, 18); // per-set reps
const pushT = (c: Ctx) => clamp(r5((c.b.pushups ?? 15) * c.vol * c.goalMod * c.ageF), 12, 150);
const squatT = (c: Ctx) => clamp(r5((c.b.squats ?? 25) * c.vol * c.ageF), 15, 180);
const lungeT = (c: Ctx) => clamp(r5((c.b.squats ?? 20) * c.vol * 0.6 * c.ageF), 10, 100);
const pullT = (c: Ctx) => clamp(Math.round((c.b.pullups ?? 6) * c.vol * 0.5), 3, 30);
const runKm = (c: Ctx) => clamp(km(1.4 * c.prog * c.goalMod), 0.5, 6);
const plankS = (c: Ctx) => clamp(r5(40 * c.prog), 30, 180);
function benchLine(c: Ctx) {
  const w = c.b.bench_kg ? ` at ~${Math.round(c.b.bench_kg * 0.8)}kg` : " (working weight)";
  return `Bench press · 4 × ${repsSet(8, c)}${w}`;
}

const BODYWEIGHT: Move[] = [
  { key: "push", tags: ["muscle", "strength"], render: (c) => `${pushT(c)} push-ups` },
  { key: "squat", tags: ["muscle", "fatloss"], render: (c) => `${squatT(c)} bodyweight squats` },
  { key: "lunge", render: (c) => `${lungeT(c)} walking lunges` },
  { key: "plank", render: (c) => `${plankS(c)}s plank hold` },
  { key: "burpee", tags: ["fatloss", "endurance"], render: (c) => `${clamp(r5(10 * c.prog), 8, 50)} burpees` },
  { key: "situp", render: (c) => `${clamp(r5(25 * c.vol * 0.7), 15, 120)} sit-ups` },
  { key: "run", tags: ["fatloss", "endurance"], render: (c) => `Run ${runKm(c)}km` },
  { key: "climber", tags: ["fatloss"], render: (c) => `${clamp(r5(30 * c.vol * 0.6), 20, 120)} mountain climbers` },
  { key: "dip", tags: ["muscle", "strength"], render: (c) => `${clamp(r5(10 * c.vol * 0.7), 8, 60)} chair dips` },
  { key: "pike", tags: ["muscle"], render: (c) => `${clamp(r5(8 * c.vol * 0.6), 6, 40)} pike push-ups` },
];
const DUMBBELL: Move[] = [
  { key: "db_press", tags: ["muscle", "strength"], render: (c) => `Dumbbell press · 4 × ${repsSet(10, c)}` },
  { key: "db_row", tags: ["muscle", "strength"], render: (c) => `Dumbbell rows · 4 × ${repsSet(10, c)} each arm` },
  { key: "goblet", tags: ["muscle", "strength", "fatloss"], render: (c) => `Goblet squats · 4 × ${repsSet(12, c)}` },
  { key: "db_ohp", tags: ["muscle", "strength"], render: (c) => `Overhead press · 3 × ${repsSet(10, c)}` },
  { key: "curl", tags: ["muscle"], render: (c) => `Dumbbell curls · 3 × ${repsSet(12, c)}` },
  { key: "db_lunge", tags: ["muscle", "fatloss"], render: (c) => `Dumbbell lunges · 3 × ${repsSet(12, c)} each leg` },
  { key: "rdl", tags: ["strength"], render: (c) => `Dumbbell RDLs · 3 × ${repsSet(12, c)}` },
  { key: "pull", tags: ["muscle", "strength"], render: (c) => `${pullT(c)} pull-ups` },
];
const GYM: Move[] = [
  { key: "bench", tags: ["muscle", "strength"], render: benchLine },
  { key: "bbsquat", tags: ["strength", "muscle"], render: (c) => `Barbell squats · 5 × ${repsSet(5, c)}` },
  { key: "deadlift", tags: ["strength"], render: (c) => `Deadlifts · 4 × ${repsSet(5, c)}` },
  { key: "gpull", tags: ["muscle", "strength"], render: (c) => `${pullT(c)} pull-ups` },
  { key: "bbrow", tags: ["muscle", "strength"], render: (c) => `Barbell rows · 4 × ${repsSet(8, c)}` },
  { key: "bbohp", tags: ["strength", "muscle"], render: (c) => `Overhead press · 4 × ${repsSet(6, c)}` },
];

function poolFor(eq: string | null | undefined, goalKey: string | null): Move[] {
  const e = (eq || "").toLowerCase();
  let pool = [...BODYWEIGHT];
  if (/dumbbell|kettlebell|home|band/.test(e)) pool = [...BODYWEIGHT, ...DUMBBELL];
  else if (/gym|full|barbell|machine/.test(e)) pool = [...BODYWEIGHT, ...DUMBBELL, ...GYM];
  if (goalKey) { const f = pool.filter((m) => !m.tags || m.tags.includes(goalKey)); if (f.length >= 4) return f; }
  return pool;
}
function ageFactor(dob?: string | null): number {
  if (!dob) return 1;
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86_400_000));
  return age >= 55 ? 0.75 : age >= 45 ? 0.85 : age >= 35 ? 0.95 : 1;
}

interface Gen { fitness_level?: string | null; equipment?: string | null; goals?: string[] | null; dob?: string | null; baseline?: Baseline | null; difficulty?: number | null; denomination?: string | null }
interface GenQuest { quest_key: string; pillar: string; title: string; sub: string; stat: string; xp: number; goal: number }

/** Build today's three personalised quests from the user's profile + level. */
export function generateQuests(p: Gen, level: number, scriptureIndex: number): GenQuest[] {
  // adaptive difficulty: a per-user factor auto-tuned by feedback (still clamped by caps)
  const diff = Math.max(0.6, Math.min(1.6, Number(p.difficulty) || 1));
  const vol = (2 + Math.min(level * 0.04, 2)) * diff; // daily rep-total multiplier
  const prog = (1 + Math.min(level * 0.02, 0.8)) * diff; // per-set / distance / time
  const goals = (p.goals || []).map((g) => String(g).toLowerCase());
  const isMuscle = goals.some((g) => /muscle|strength|gain|build|mass/.test(g));
  const isFat = goals.some((g) => /fat|lean|loss|cut|weight/.test(g));
  const goalKey = isMuscle ? "muscle" : isFat ? "fatloss" : null;
  const ctx: Ctx = { vol, prog, goalMod: isFat ? 1.12 : isMuscle ? 0.95 : 1, ageF: ageFactor(p.dob), b: p.baseline || {} };
  const di = dayIndex();

  const pool = poolFor(p.equipment, goalKey);
  const a = pool[di % pool.length];
  const b = pool[(di * 5 + 2) % pool.length];
  const body = (a.key === b.key ? [a] : [a, b]).map((m) => m.render(ctx)).join(" + ");

  const plan = buildPlan(traditionOf(p.denomination));
  const passage = plan[scriptureIndex % plan.length];
  const tier = 1 + Math.floor(level / 3);
  return [
    { quest_key: "word", pillar: "SCRIPTURE RAID", title: `Read ${passage}`, sub: "Take ground in the Word", stat: "WIS", xp: 30, goal: 1 },
    { quest_key: "body", pillar: "FITNESS GUILD", title: body, sub: level > 0 ? `Tier ${tier} · scaled to you` : "Train the temple", stat: "STR", xp: Math.round(40 * Math.min(prog, 2)), goal: 1 },
    { quest_key: "brother", pillar: "BROTHERHOOD", title: BROTHER[di % BROTHER.length], sub: "No man climbs alone", stat: "MANA", xp: 20, goal: 1 },
  ];
}

/** Load (or generate + seed) today's quests for a user. */
// Backlog cap: a man clears quests at his own pace. We pause generating new ones
// while more than this many are still pending, then resume once cleared down.
const BACKLOG_CAP = 3;

export async function loadToday(userId: string): Promise<Quest[]> {
  const day = todayKey();
  const SEL = "id, quest_key, pillar, title, sub, xp, stat, done";
  // the active list = everything still pending (may carry across days)
  const { data: backlog } = await supabase.from("quests").select(SEL).eq("user_id", userId).eq("done", false).order("day", { ascending: true });
  const list = (backlog as Quest[]) ?? [];
  // one batch per day, and only if the backlog is cleared down to the cap
  const { count: todayCount } = await supabase.from("quests").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("day", day);
  if ((todayCount ?? 0) > 0) return list;        // already generated today -> show the list
  if (list.length > BACKLOG_CAP) return list;    // paused: clear some before more arrive
  const { data: prof } = await supabase.from("profiles").select("fitness_level, equipment, goals, dob, baseline, difficulty, denomination, disciplines, xp").eq("user_id", userId).maybeSingle();
  const level = levelFromXp(Number(prof?.xp) || 0);
  // scripture advances with completion: how many Word quests they've finished
  const { count } = await supabase.from("quests").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("quest_key", "word").eq("done", true);
  const core = generateQuests((prof as Gen) || {}, level, count || 0);
  // bonus disciplines (opt-in packs), denomination-aware
  let disc: { quest_key: string; pillar: string; title: string; sub: string; stat: string; xp: number; goal: number }[] = [];
  const prefs = (prof as { disciplines?: Record<string, unknown> } | null)?.disciplines;
  if (prefs && Object.keys(prefs).length) {
    let weight_kg: number | null = null, protein_target: number | null = null;
    if (prefs.fuel) {
      const { data: ng } = await supabase.from("nutrition_goals").select("weight_kg, protein_target").eq("user_id", userId).maybeSingle();
      weight_kg = (ng?.weight_kg as number) ?? null; protein_target = (ng?.protein_target as number) ?? null;
    }
    const denom = (prof as { denomination?: string })?.denomination;
    const lit = liturgicalContext(new Date(), traditionOf(denom));
    disc = generateDisciplineQuests({ denomination: denom, goals: (prof as Gen)?.goals, disciplines: prefs, weight_kg, protein_target }, dayIndex(), new Date().getDay(), lit.fasting ? lit.note : null);
  }
  const rows = [...core, ...disc].map((q) => ({ ...q, user_id: userId, day, done: false, progress: 0 }));
  const ins = await supabase.from("quests").insert(rows).select(SEL);
  return [...list, ...((ins.data as Quest[]) ?? [])];
}

// quest pillar -> RPG stat (STR/AGI/WIS/MANA)
const STAT_BY_KEY: Record<string, string> = { body: "STR", word: "WIS", brother: "MANA" };

/** Toggle a quest done/undone and atomically award/remove its XP + stat. */
export async function toggleQuest(userId: string, quest: Quest, done: boolean): Promise<void> {
  await supabase.from("quests").update({ done, progress: done ? 1 : 0 }).eq("id", quest.id);
  const stat = quest.stat ?? STAT_BY_KEY[quest.quest_key] ?? null;
  await supabase.rpc("apply_quest_delta", { p_xp: done ? quest.xp : -quest.xp, p_stat: stat, p_stat_delta: stat ? (done ? 1 : -1) : 0 });
}

/** Seal the day when all quests are done. Idempotent per day; bumps streak once. */
export async function sealDay(userId: string): Promise<void> {
  const day = todayKey();
  await supabase.from("day_history").upsert({ user_id: userId, day, status: "sealed" });
  const { data } = await supabase.from("profiles").select("streak, best_streak, last_active").eq("user_id", userId).maybeSingle();
  const last = data?.last_active ? String(data.last_active).slice(0, 10) : null;
  if (last === day) return; // already counted today
  const yesterday = todayKey(new Date(Date.now() - 86_400_000));
  const streak = last === yesterday ? (Number(data?.streak) || 0) + 1 : 1;
  const best = Math.max(Number(data?.best_streak) || 0, streak);
  await supabase.from("profiles").update({ streak, best_streak: best, last_active: new Date().toISOString() }).eq("user_id", userId);
}

/** Today's difficulty feedback, if already given (so we ask only once a day). */
export async function getDayFeedback(userId: string): Promise<string | null> {
  const { data } = await supabase.from("day_history").select("feedback").eq("user_id", userId).eq("day", todayKey()).maybeSingle();
  return data?.feedback ?? null;
}

/** Record how the day felt and auto-tune the user's fitness difficulty factor.
 *  Affects only the body quest scaling; outputs stay hard-capped to realistic limits. */
export async function recordDayFeedback(userId: string, signal: "easy" | "right" | "hard"): Promise<void> {
  await supabase.from("day_history").upsert({ user_id: userId, day: todayKey(), status: "sealed", feedback: signal });
  if (signal === "right") return;
  const { data } = await supabase.from("profiles").select("difficulty").eq("user_id", userId).maybeSingle();
  const cur = Number(data?.difficulty) || 1;
  const next = Math.max(0.6, Math.min(1.6, signal === "easy" ? cur * 1.08 : cur * 0.92));
  await supabase.from("profiles").update({ difficulty: next }).eq("user_id", userId);
}
