// proto-state.jsx — TABOR core data engine
// Real day-rollover, XP→level→rank math, streak + freeze, history, profile/settings.
const { useState: useTS, useEffect: useTE, useRef: useTR } = React;

const RANKS = ["Recruit", "Initiate", "Tempered", "Forged", "Crucible", "Ascended", "Supersonic Fit"];
const RANK_LEVELS = [1, 6, 12, 20, 30, 42, 55];
const XP_PER_LEVEL = 500;
const CLASSES = {
  Sentinel: { tag: "The guardian", blurb: "Balanced and steady. You hold the line.", lean: "Even" },
  Scribe:   { tag: "The student",  blurb: "You lean into the Word and Wisdom.",       lean: "WIS" },
  Crusader: { tag: "The fighter",  blurb: "You lean into the iron and Strength.",      lean: "STR" },
  Pilgrim:  { tag: "The seeker",   blurb: "New to the climb. Guided gently.",          lean: "AGI" },
};
const STAT_KEYS = ["STR", "AGI", "WIS", "MANA"];
const STAT_NAMES = { STR: "Strength", AGI: "Agility", WIS: "Wisdom", MANA: "Spirit" };

const DEFAULT_QUESTS = [
  { id: "scout", pillar: "Scripture Raid", title: "Scout the Chapter", sub: "Read John 1:1 to 1:14, then a short drill.", stat: "WIS", xp: 120, done: false, tab: "scripture" },
  { id: "iron",  pillar: "Fitness Guild",  title: "Iron Body", sub: "7,500 steps or a 20-minute workout.", stat: "STR", xp: 140, done: false, tab: "body" },
  { id: "line",  pillar: "Brotherhood",    title: "Hold the Line", sub: "Check in with your guild. One honest line.", stat: "MANA", xp: 90, done: false, tab: "guild" },
];

const ACHIEVEMENTS = [
  { id: "first-blood", name: "First Light", desc: "Complete your first quest.", icon: "✦" },
  { id: "week-one", name: "Seven Days", desc: "Hold a 7 day streak.", icon: "◇" },
  { id: "tempered", name: "Tempered", desc: "Reach the rank of Tempered.", icon: "▲" },
  { id: "forged", name: "Forged", desc: "Reach the rank of Forged.", icon: "✝" },
  { id: "iron-will", name: "Iron Will", desc: "Log 25 workouts.", icon: "⚔" },
  { id: "scholar", name: "The Scholar", desc: "Read 50 chapters.", icon: "✚" },
  { id: "unbroken", name: "Unbroken", desc: "Hold a 50 day streak.", icon: "❖" },
  { id: "brother", name: "Brother's Keeper", desc: "Check in 30 days running.", icon: "⌂" },
];

const SYSTEM = {
  dawn: (cls, rank) => `Dawn, ${cls}. Three trials stand between you and ${rank}.`,
  questDone: { scout: "The chapter is scouted. Wisdom rises.", iron: "Iron logged. The body is tempered.", line: "You did not climb alone today." },
  allDone: "The day is held. Rest, Son of Fire. Dawn brings the next ascent.",
  streakRisk: "Your streak still stands. Do not let it fall tonight.",
};

const RANK_THRESHOLD = 1500;

// ── date helpers ──
function dstr(d) { return d.toISOString().slice(0, 10); }
function todayStr() { return dstr(new Date()); }
function addDays(s, n) { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return dstr(d); }

// ── derived math ──
function levelFromXp(xp) { return Math.floor(xp / XP_PER_LEVEL) + 1; }
function rankIdxFromLevel(lvl) { let r = 0; for (let i = 0; i < RANK_LEVELS.length; i++) if (lvl >= RANK_LEVELS[i]) r = i; return r; }
function xpAtLevel(lvl) { return (lvl - 1) * XP_PER_LEVEL; }

function makeFresh() {
  const today = todayStr();
  const history = {};
  for (let i = 1; i <= 34; i++) { const d = addDays(today, -i); history[d] = (i === 5 || i === 17) ? "frozen" : (i === 23 ? "missed" : "sealed"); }
  return {
    onboarded: false, name: "", cls: "Sentinel", denomination: "Orthodox",
    journey: "Steady", fitnessLevel: "Intermediate", goals: [], equipment: "Minimal",
    xp: 6750, stats: { STR: 5200, AGI: 3400, WIS: 4600, MANA: 3900 },
    streak: 47, bestStreak: 63, freezes: 2,
    quests: DEFAULT_QUESTS.map(q => ({ ...q, done: false })),
    lastActive: addDays(today, -1), history,
    bookmarks: [], highlights: {},
    tabataPresets: [], workoutHistory: [{ date: addDays(today, -1), name: "The Forge", mins: 25 }, { date: addDays(today, -2), name: "Tabata", mins: 8 }],
    prs: { "Push-ups": "4 x 18", "Pull-ups": "4 x 8", "KB Swing": "4 x 24" },
    chaptersRead: 12, workoutsLogged: 18,
    notes: [
      { id: "n1", cat: "scripture", title: "John 1 — the Word", body: "The light shines in the darkness and the darkness has not overcome it. Hold this when the day gets heavy.", ref: "John 1:5", date: addDays(today, -1) },
      { id: "n2", cat: "fitness", title: "Forge session", body: "Pull-ups still the weak link. Add negatives and dead hangs next week.", ref: "The Forge", date: addDays(today, -2) },
    ],
    aiOptIn: true,
    avatar: "", ironSteps: 0, ironGoal: 7500, seekerLessons: [],
    notifications: [
      { id: 1, kind: "rank", title: "Rank Attained", body: "You are Forged. Your guild has been told.", time: "6:20", read: false },
      { id: 2, kind: "nudge", title: "Hold the Line", body: "Marcus checked in. Your line is still owed today.", time: "7:02", read: false },
      { id: 3, kind: "guild", title: "Sons of Tabor · IV", body: "Tomas: 47 days. You in tomorrow?", time: "8:02", read: true },
      { id: 4, kind: "quest", title: "Daily Quest Issued", body: "Three trials await, Sentinel.", time: "6:00", read: true },
    ],
    guildLine: "",
    achievements: ["first-blood", "week-one", "tempered"],
    notifPrefs: { rank: true, nudge: true, quest: true, streak: true, quiet: false },
    settings: { reducedMotion: false, sound: true },
  };
}

// ── day rollover reconciliation ──
function reconcile(s) {
  const today = todayStr();
  if (s.lastActive === today) return s;
  let { streak, freezes } = s;
  const history = { ...s.history };
  if (s.lastActive) {
    const yesterday = addDays(today, -1);
    let cur = addDays(s.lastActive, 1);
    let guard = 0;
    while (cur <= yesterday && guard < 400) {
      if (history[cur] !== "sealed") {
        if (freezes > 0) { freezes -= 1; history[cur] = "frozen"; }
        else { streak = 0; history[cur] = "missed"; }
      }
      cur = addDays(cur, 1); guard++;
    }
  }
  return { ...s, streak, freezes, history, lastActive: today, quests: s.quests.map(q => ({ ...q, done: false })) };
}

const KEY = "tabor_proto_v3";
function loadState() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.data) return reconcile(s.data); } catch (e) {}
  return makeFresh();
}
function saveState(data) { try { localStorage.setItem(KEY, JSON.stringify({ data })); } catch (e) {} }

function useTabor(opts) {
  const persist = !opts || opts.persist !== false;
  const [s, setS] = useTS(() => persist ? loadState() : reconcile({ ...makeFresh(), ...((opts && opts.seed) || {}) }));
  useTE(() => { if (persist) saveState(s); }, [s]);

  const level = levelFromXp(s.xp);
  const rankIdx = rankIdxFromLevel(level);
  const rankName = RANKS[rankIdx];
  const nextRankIdx = Math.min(rankIdx + 1, RANKS.length - 1);
  const nextRank = RANKS[nextRankIdx];
  const maxed = rankIdx === RANKS.length - 1;
  const base = xpAtLevel(RANK_LEVELS[rankIdx]);
  const ceil = xpAtLevel(RANK_LEVELS[nextRankIdx]);
  const rankProgress = maxed ? 1 : Math.max(0, Math.min(1, (s.xp - base) / (ceil - base)));
  const allDone = s.quests.every(q => q.done);

  const autoUnlock = (st) => {
    const have = new Set(st.achievements);
    const lvl = levelFromXp(st.xp), ri = rankIdxFromLevel(lvl);
    if (st.streak >= 7) have.add("week-one");
    if (st.streak >= 50) have.add("unbroken");
    if (ri >= 2) have.add("tempered");
    if (ri >= 3) have.add("forged");
    return [...have];
  };

  const actions = {
    completeQuest(id) {
      setS(prev => {
        if (prev.quests.find(q => q.id === id)?.done) return prev;
        const q = prev.quests.find(x => x.id === id);
        const quests = prev.quests.map(x => x.id === id ? { ...x, done: true } : x);
        const stats = { ...prev.stats, [q.stat]: prev.stats[q.stat] + Math.round(q.xp * 0.6) };
        let xp = prev.xp + q.xp;
        let streak = prev.streak, bestStreak = prev.bestStreak;
        const history = { ...prev.history };
        const t = todayStr();
        const nowAll = quests.every(x => x.done);
        if (nowAll && history[t] !== "sealed") { history[t] = "sealed"; streak = prev.streak + 1; bestStreak = Math.max(prev.bestStreak, streak); }
        let achievements = [...prev.achievements]; if (!achievements.includes("first-blood")) achievements.push("first-blood");
        const next = { ...prev, quests, stats, xp, streak, bestStreak, history, achievements };
        return { ...next, achievements: autoUnlock(next) };
      });
    },
    resetDay() { setS(prev => ({ ...prev, quests: prev.quests.map(q => ({ ...q, done: false })) })); },
    rankUp() {
      setS(prev => {
        const lvl = levelFromXp(prev.xp), ri = rankIdxFromLevel(lvl);
        const nextLvl = RANK_LEVELS[Math.min(ri + 1, RANK_LEVELS.length - 1)];
        const xp = xpAtLevel(nextLvl) + 60;
        const next = { ...prev, xp };
        return { ...next, achievements: autoUnlock(next) };
      });
    },
    useFreeze() {
      setS(prev => { if (prev.freezes <= 0) return prev; const history = { ...prev.history, [todayStr()]: "frozen" }; return { ...prev, freezes: prev.freezes - 1, history }; });
    },
    setGuildLine(line) { setS(prev => ({ ...prev, guildLine: line })); },
    updateProfile(p) { setS(prev => ({ ...prev, ...p })); },
    setNotifPref(k, v) { setS(prev => ({ ...prev, notifPrefs: { ...prev.notifPrefs, [k]: v } })); },
    setSetting(k, v) { setS(prev => ({ ...prev, settings: { ...prev.settings, [k]: v } })); },
    toggleBookmark(ref) { setS(prev => ({ ...prev, bookmarks: prev.bookmarks.includes(ref) ? prev.bookmarks.filter(b => b !== ref) : [...prev.bookmarks, ref] })); },
    savePreset(p) { setS(prev => ({ ...prev, tabataPresets: [...prev.tabataPresets, p] })); },
    logWorkout(name, mins) { setS(prev => ({ ...prev, workoutHistory: [{ date: todayStr(), name, mins }, ...prev.workoutHistory], workoutsLogged: prev.workoutsLogged + 1 })); },
    addNote(n) { setS(prev => ({ ...prev, notes: [{ ...n, id: "n" + Date.now(), date: todayStr() }, ...prev.notes] })); },
    deleteNote(id) { setS(prev => ({ ...prev, notes: prev.notes.filter(x => x.id !== id) })); },
    setAiOptIn(v) { setS(prev => ({ ...prev, aiOptIn: v })); },
    setAvatar(url) { setS(prev => ({ ...prev, avatar: url })); },
    addSteps(n) { setS(prev => ({ ...prev, ironSteps: Math.min(prev.ironGoal, prev.ironSteps + n) })); },
    markNotifsRead() { setS(prev => ({ ...prev, notifications: prev.notifications.map(x => ({ ...x, read: true })) })); },
    completeLesson(id) { setS(prev => ({ ...prev, seekerLessons: prev.seekerLessons.includes(id) ? prev.seekerLessons : [...prev.seekerLessons, id] })); },
    finishOnboarding(profile) { setS(prev => ({ ...prev, onboarded: true, ...profile, name: (profile && profile.name) || "Hannes" })); },
    hardReset() { setS(makeFresh()); },
  };

  return { s, setS, level, rankIdx, rankName, nextRank, rankProgress, maxed, allDone, actions };
}

Object.assign(window, { useTabor, RANKS, RANK_LEVELS, CLASSES, STAT_KEYS, STAT_NAMES, SYSTEM, DEFAULT_QUESTS, ACHIEVEMENTS, RANK_THRESHOLD, todayStr, addDays, dstr, levelFromXp });
