// Daily-quest persistence + the INITIAL (rule-based) personalized quest engine.
// Designed to run solo for 6+ months before any AI layer: deep reading plan,
// equipment-tiered movement pools, baseline-anchored scaling, level-driven
// progression. Quests escalate as the user levels up ("progress pushes it").
import { supabase } from "./supabase";
import { levelFromXp } from "./game";

export interface Quest {
  id: string;
  quest_key: string;
  pillar: string;
  title: string;
  sub: string | null;
  xp: number;
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
function buildPlan(): string[] {
  const out: string[] = [];
  for (const [book, a, b] of PLAN_SEQ) for (let i = a; i <= b; i++) out.push(`${book} ${i}`);
  return out;
}
const READING_PLAN = buildPlan();

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
interface Baseline { pushups?: number; squats?: number; pullups?: number; bench_kg?: number; bench_reps?: number; db_kg?: number }
interface Ctx { prog: number; goalMod: number; ageF: number; b: Baseline }
type Move = { key: string; tags?: string[]; render: (c: Ctx) => string };

const r5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);
const reps = (base: number, c: Ctx) => Math.max(6, Math.round(base * c.prog * c.goalMod));
const km = (n: number) => Math.max(0.5, Math.round(n * 2) / 2);
const pushT = (c: Ctx) => r5((c.b.pushups ? c.b.pushups * 2 : 40) * c.prog * c.goalMod * c.ageF);
const squatT = (c: Ctx) => r5((c.b.squats ? c.b.squats * 2 : 50) * c.prog * c.ageF);
const pullT = (c: Ctx) => Math.max(3, Math.round((c.b.pullups ? c.b.pullups * 1.6 : 8) * c.prog));
function benchLine(c: Ctx) {
  const w = c.b.bench_kg ? ` at ~${Math.round(c.b.bench_kg * 0.8)}kg` : " (working weight)";
  return `Bench press · 4 × ${reps(8, c)}${w}`;
}

const BODYWEIGHT: Move[] = [
  { key: "push", tags: ["muscle", "strength"], render: (c) => `${pushT(c)} push-ups` },
  { key: "squat", tags: ["muscle", "fatloss"], render: (c) => `${squatT(c)} bodyweight squats` },
  { key: "lunge", render: (c) => `${r5((c.b.squats ? c.b.squats * 1.2 : 30) * c.prog)} walking lunges` },
  { key: "plank", render: (c) => `${Math.max(30, Math.round((40 * c.prog) / 5) * 5)}s plank hold` },
  { key: "burpee", tags: ["fatloss", "endurance"], render: (c) => `${r5(15 * c.prog)} burpees` },
  { key: "situp", render: (c) => `${r5(30 * c.prog)} sit-ups` },
  { key: "run", tags: ["fatloss", "endurance"], render: (c) => `Run ${km(1.5 * c.prog * c.goalMod)}km` },
  { key: "climber", tags: ["fatloss"], render: (c) => `${r5(40 * c.prog)} mountain climbers` },
  { key: "dip", tags: ["muscle", "strength"], render: (c) => `${r5(15 * c.prog)} chair dips` },
  { key: "pike", tags: ["muscle"], render: (c) => `${r5(12 * c.prog)} pike push-ups` },
];
const DUMBBELL: Move[] = [
  { key: "db_press", tags: ["muscle", "strength"], render: (c) => `Dumbbell press · 4 × ${reps(10, c)}` },
  { key: "db_row", tags: ["muscle", "strength"], render: (c) => `Dumbbell rows · 4 × ${reps(10, c)} each arm` },
  { key: "goblet", tags: ["muscle", "strength", "fatloss"], render: (c) => `Goblet squats · 4 × ${reps(12, c)}` },
  { key: "db_ohp", tags: ["muscle", "strength"], render: (c) => `Overhead press · 3 × ${reps(10, c)}` },
  { key: "curl", tags: ["muscle"], render: (c) => `Dumbbell curls · 3 × ${reps(12, c)}` },
  { key: "db_lunge", tags: ["muscle", "fatloss"], render: (c) => `Dumbbell lunges · 3 × ${reps(12, c)} each leg` },
  { key: "rdl", tags: ["strength"], render: (c) => `Dumbbell RDLs · 3 × ${reps(12, c)}` },
  { key: "pull", tags: ["muscle", "strength"], render: (c) => `${pullT(c)} pull-ups` },
];
const GYM: Move[] = [
  { key: "bench", tags: ["muscle", "strength"], render: benchLine },
  { key: "bbsquat", tags: ["strength", "muscle"], render: (c) => `Barbell squats · 5 × ${reps(5, c)}` },
  { key: "deadlift", tags: ["strength"], render: (c) => `Deadlifts · 4 × ${reps(5, c)}` },
  { key: "gpull", tags: ["muscle", "strength"], render: (c) => `${pullT(c)} pull-ups` },
  { key: "bbrow", tags: ["muscle", "strength"], render: (c) => `Barbell rows · 4 × ${reps(8, c)}` },
  { key: "bbohp", tags: ["strength", "muscle"], render: (c) => `Overhead press · 4 × ${reps(6, c)}` },
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

interface Gen { fitness_level?: string | null; equipment?: string | null; goals?: string[] | null; dob?: string | null; baseline?: Baseline | null }
interface GenQuest { quest_key: string; pillar: string; title: string; sub: string; stat: string; xp: number; goal: number }

/** Build today's three personalised quests from the user's profile + level. */
export function generateQuests(p: Gen, level: number, scriptureIndex: number): GenQuest[] {
  const prog = 1 + Math.min(level * 0.03, 1.6); // progress-driven escalation, caps ~+160%
  const goals = (p.goals || []).map((g) => String(g).toLowerCase());
  const isMuscle = goals.some((g) => /muscle|strength|gain|build|mass/.test(g));
  const isFat = goals.some((g) => /fat|lean|loss|cut|weight/.test(g));
  const goalKey = isMuscle ? "muscle" : isFat ? "fatloss" : null;
  const ctx: Ctx = { prog, goalMod: isFat ? 1.12 : isMuscle ? 0.95 : 1, ageF: ageFactor(p.dob), b: p.baseline || {} };
  const di = dayIndex();

  const pool = poolFor(p.equipment, goalKey);
  const a = pool[di % pool.length];
  const b = pool[(di * 5 + 2) % pool.length];
  const body = (a.key === b.key ? [a] : [a, b]).map((m) => m.render(ctx)).join(" + ");

  const passage = READING_PLAN[scriptureIndex % READING_PLAN.length];
  const tier = 1 + Math.floor(level / 3);
  return [
    { quest_key: "word", pillar: "SCRIPTURE RAID", title: `Read ${passage}`, sub: "Take ground in the Word", stat: "WIS", xp: 30, goal: 1 },
    { quest_key: "body", pillar: "FITNESS GUILD", title: body, sub: level > 0 ? `Tier ${tier} · scaled to you` : "Train the temple", stat: "STR", xp: Math.round(40 * Math.min(prog, 2)), goal: 1 },
    { quest_key: "brother", pillar: "BROTHERHOOD", title: BROTHER[di % BROTHER.length], sub: "No man climbs alone", stat: "MANA", xp: 20, goal: 1 },
  ];
}

/** Load (or generate + seed) today's quests for a user. */
export async function loadToday(userId: string): Promise<Quest[]> {
  const day = todayKey();
  const { data } = await supabase.from("quests").select("id, quest_key, pillar, title, sub, xp, done").eq("user_id", userId).eq("day", day);
  if (data && data.length) return data as Quest[];
  const { data: prof } = await supabase.from("profiles").select("fitness_level, equipment, goals, dob, baseline, xp").eq("user_id", userId).maybeSingle();
  const level = levelFromXp(Number(prof?.xp) || 0);
  // scripture advances with completion: how many Word quests they've finished
  const { count } = await supabase.from("quests").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("quest_key", "word").eq("done", true);
  const gen = generateQuests((prof as Gen) || {}, level, count || 0);
  const rows = gen.map((q) => ({ ...q, user_id: userId, day, done: false, progress: 0 }));
  const ins = await supabase.from("quests").insert(rows).select("id, quest_key, pillar, title, sub, xp, done");
  return (ins.data as Quest[]) ?? [];
}

// quest pillar -> RPG stat (STR/AGI/WIS/MANA)
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
  const yesterday = todayKey(new Date(Date.now() - 86_400_000));
  const streak = last === yesterday ? (Number(data?.streak) || 0) + 1 : 1;
  const best = Math.max(Number(data?.best_streak) || 0, streak);
  await supabase.from("profiles").update({ streak, best_streak: best, last_active: new Date().toISOString() }).eq("user_id", userId);
}
