import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getGoals, getDiary, deleteLog, searchFoods, logFood, saveGoals, type Goals, type LogRow, type Food } from "@/lib/nutrition";
import { useActionSheet } from "@/components/ActionSheet";
import { Celebration } from "@/components/Celebration";
import { C, F } from "@/lib/theme";

const MEALS = ["breakfast", "lunch", "dinner", "snack"];

export default function Fuel() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const today = new Date().toISOString().slice(0, 10);
  const [phase, setPhase] = useState<"loading" | "consent" | "setup" | "diary">("loading");
  const [goals, setGoalsState] = useState<Goals | null>(null);
  const [rows, setRows] = useState<LogRow[]>([]);

  async function refresh() {
    if (!userId) return;
    setRows(await getDiary(userId, today));
  }
  async function init() {
    if (!userId) return;
    const { data: prof } = await supabase.from("profiles").select("consent").eq("user_id", userId).maybeSingle();
    const consent = (prof?.consent ?? {}) as { health?: boolean };
    if (!consent.health) { setPhase("consent"); return; }
    const g = await getGoals(userId);
    setGoalsState(g);
    await refresh();
    setPhase(g ? "diary" : "setup");
  }
  useEffect(() => { init(); /* eslint-disable-next-line */ }, [userId]);
  // re-pull the diary whenever this screen regains focus (e.g. returning from /scan)
  useFocusEffect(useCallback(() => { refresh(); /* eslint-disable-next-line */ }, [userId]));

  async function acceptConsent() {
    if (!userId) return;
    const { data: prof } = await supabase.from("profiles").select("consent").eq("user_id", userId).maybeSingle();
    await supabase.from("profiles").update({ consent: { ...(prof?.consent ?? {}), health: true } }).eq("user_id", userId);
    init();
  }

  if (phase === "loading") return <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
          <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Fuel</Text>
        </View>
        {phase === "diary" && <Pressable onPress={() => setPhase("setup")}><Text style={{ color: C.gold, fontSize: 12, fontFamily: F.mono }}>TARGETS</Text></Pressable>}
      </View>

      {phase === "consent" && <Consent onAccept={acceptConsent} onBack={() => router.back()} />}
      {phase === "setup" && <GoalSetup userId={userId!} initial={goals} onDone={() => init()} />}
      {phase === "diary" && goals && <Diary goals={goals} rows={rows} today={today} onScan={() => router.push(`/scan?date=${today}`)} onChange={refresh} userId={userId!} />}
    </SafeAreaView>
  );
}

function Consent({ onAccept, onBack }: { onAccept: () => void; onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 26 }}>
      <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 4, fontFamily: F.mono }}>[ FUEL THE TEMPLE ]</Text>
      <Text style={{ color: C.ivory, fontSize: 22, fontFamily: F.head, marginTop: 8 }}>Track your nutrition</Text>
      <Text style={{ color: C.text, fontSize: 14.5, lineHeight: 22, fontFamily: F.body, marginTop: 12 }}>
        To log food and calories we store your nutrition and body metrics. This is health data, kept private to you, never sold, and erased instantly if you delete your account. We need your explicit consent to begin.
      </Text>
      <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body, marginTop: 10 }}>This is general fitness information, not medical advice.</Text>
      <Pressable onPress={onAccept} style={{ backgroundColor: C.gold, paddingVertical: 14, alignItems: "center", borderRadius: 12, marginTop: 20 }}><Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>I CONSENT, BEGIN</Text></Pressable>
      <Pressable onPress={onBack} style={{ marginTop: 14, alignItems: "center" }}><Text style={{ color: C.muted, fontFamily: F.body }}>Not now</Text></Pressable>
    </ScrollView>
  );
}

function GoalSetup({ userId, initial, onDone }: { userId: string; initial: Goals | null; onDone: () => void }) {
  const [f, setF] = useState({ weight_kg: "", height_cm: "", age: "", sex: "male", activity: "1.55", goal_type: "fat_loss" });
  const sheet = useActionSheet();
  const ACT = [{ v: "1.2", l: "Low" }, { v: "1.375", l: "Light" }, { v: "1.55", l: "Moderate" }, { v: "1.725", l: "High" }];
  const GOAL = [{ v: "fat_loss", l: "Fat loss" }, { v: "maintain", l: "Maintain" }, { v: "muscle_gain", l: "Muscle" }];
  async function save() {
    if (!f.weight_kg || !f.height_cm || !f.age) { sheet({ title: "Fill it in", message: "We need weight, height, and age to set your targets.", actions: [{ label: "Got it", style: "cancel" }] }); return; }
    await saveGoals(userId, { weight_kg: +f.weight_kg, height_cm: +f.height_cm, age: +f.age, sex: f.sex, activity: +f.activity, goal_type: f.goal_type });
    onDone();
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 22 }}>
      <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono }}>SET YOUR TARGETS</Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <View style={{ flex: 1 }}><Text style={lbl}>Weight (kg)</Text><TextInput value={f.weight_kg} onChangeText={(t) => setF({ ...f, weight_kg: t.replace(/[^0-9.]/g, "") })} keyboardType="numeric" style={inp} /></View>
        <View style={{ flex: 1 }}><Text style={lbl}>Height (cm)</Text><TextInput value={f.height_cm} onChangeText={(t) => setF({ ...f, height_cm: t.replace(/[^0-9.]/g, "") })} keyboardType="numeric" style={inp} /></View>
        <View style={{ flex: 1 }}><Text style={lbl}>Age</Text><TextInput value={f.age} onChangeText={(t) => setF({ ...f, age: t.replace(/[^0-9]/g, "") })} keyboardType="number-pad" style={inp} /></View>
      </View>
      <Text style={lbl}>Sex (for the formula)</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>{["male", "female"].map((s) => <Chip key={s} label={s} on={f.sex === s} onPress={() => setF({ ...f, sex: s })} />)}</View>
      <Text style={lbl}>Activity</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>{ACT.map((a) => <Chip key={a.v} label={a.l} on={f.activity === a.v} onPress={() => setF({ ...f, activity: a.v })} />)}</View>
      <Text style={lbl}>Goal</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>{GOAL.map((g) => <Chip key={g.v} label={g.l} on={f.goal_type === g.v} onPress={() => setF({ ...f, goal_type: g.v })} />)}</View>
      <Pressable onPress={save} style={{ backgroundColor: C.gold, paddingVertical: 14, alignItems: "center", borderRadius: 12, marginTop: 20 }}><Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>SET TARGETS</Text></Pressable>
    </ScrollView>
  );
}

function Diary({ goals, rows, today, onScan, onChange, userId }: { goals: Goals; rows: LogRow[]; today: string; onScan: () => void; onChange: () => void; userId: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [cel, setCel] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheet = useActionSheet();
  const sum = (k: keyof LogRow) => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  const kcal = sum("kcal"), protein = sum("protein"), carb = sum("carb"), fat = sum("fat");

  function onType(text: string) {
    setQ(text);
    if (timer.current) clearTimeout(timer.current);
    if (text.trim().length < 2) { setResults([]); setSearching(false); return; }
    setSearching(true);
    timer.current = setTimeout(async () => {
      const r = await searchFoods(text);
      setResults(r);
      setSearching(false);
    }, 450);
  }
  async function quickLog(food: Food) {
    sheet({
      title: food.name,
      message: "Log 100g to which meal?",
      actions: MEALS.map((mm) => ({ label: mm[0].toUpperCase() + mm.slice(1), onPress: async () => { const r = await logFood(userId, mm, food, 100, today); setQ(""); setResults([]); onChange(); if (r.firstToday) setCel(r.xp); } })),
    });
  }
  function remove(r: LogRow) { sheet({ title: "Remove?", message: r.name, actions: [{ label: "Remove", style: "destructive", onPress: async () => { await deleteLog(r.id); onChange(); } }] }); }

  return (
    <>
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      {/* totals */}
      <View style={{ borderWidth: 1, borderColor: C.gold, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Text style={{ color: C.ivory, fontSize: 30, fontFamily: F.head }}>{kcal}</Text>
          <Text style={{ color: C.muted, fontFamily: F.mono, fontSize: 12 }}>/ {goals.kcal_target} kcal · {Math.max(0, goals.kcal_target - kcal)} left</Text>
        </View>
        <Bar value={kcal} target={goals.kcal_target} />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <Macro label="Protein" v={protein} t={goals.protein_target} />
          <Macro label="Carbs" v={carb} t={goals.carb_target} />
          <Macro label="Fat" v={fat} t={goals.fat_target} />
        </View>
      </View>

      <Pressable onPress={onScan} style={{ backgroundColor: C.gold, paddingVertical: 15, alignItems: "center", borderRadius: 12, marginBottom: 14 }}><Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>SCAN A BARCODE</Text></Pressable>

      <TextInput value={q} onChangeText={onType} placeholder="Search any food (e.g. chicken breast)…" placeholderTextColor={C.muted} autoCorrect={false} style={inp} />
      {searching && <Text style={{ color: C.muted, fontFamily: F.mono, fontSize: 11, paddingVertical: 10 }}>SEARCHING…</Text>}
      {!searching && q.trim().length >= 2 && results.length === 0 && <Text style={{ color: C.muted, fontFamily: F.body, fontSize: 13, paddingVertical: 10 }}>No foods found. Try another name, or scan the barcode.</Text>}
      {results.map((r, i) => (
        <Pressable key={(r.barcode || r.id || "") + i} onPress={() => quickLog(r)} style={{ borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 11 }}>
          <Text style={{ color: C.ivory, fontFamily: F.body, fontSize: 14 }}>{r.name}{r.brand ? ` · ${r.brand}` : ""}</Text>
          <Text style={{ color: C.muted, fontFamily: F.mono, fontSize: 11 }}>{Math.round(r.kcal_100g)} kcal/100g</Text>
        </Pressable>
      ))}

      {MEALS.map((mm) => {
        const items = rows.filter((r) => r.meal === mm);
        return (
          <View key={mm} style={{ marginTop: 18 }}>
            <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginBottom: 6 }}>{mm.toUpperCase()} · {items.reduce((s, r) => s + r.kcal, 0)} KCAL</Text>
            {items.length === 0 ? <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body }}>Nothing logged.</Text> : items.map((r) => (
              <Pressable key={r.id} onLongPress={() => remove(r)} delayLongPress={350} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
                <Text style={{ color: C.text, fontFamily: F.body, fontSize: 14, flex: 1 }}>{r.name} <Text style={{ color: C.muted, fontSize: 11 }}>{r.qty_g}g</Text></Text>
                <Text style={{ color: C.text, fontFamily: F.mono, fontSize: 13 }}>{r.kcal}</Text>
              </Pressable>
            ))}
          </View>
        );
      })}
      <Text style={{ color: C.muted, fontSize: 9, fontFamily: F.mono, textAlign: "center", marginTop: 24 }}>DATA FROM OPEN FOOD FACTS (ODbL) · NOT MEDICAL ADVICE</Text>
    </ScrollView>
    <Celebration visible={cel != null} xp={cel ?? undefined} title="[ FUEL TRACKED ]" message="The temple is fed. First log of the day. Keep tracking." onDone={() => setCel(null)} />
    </>
  );
}

function Bar({ value, target }: { value: number; target: number }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return <View style={{ height: 8, backgroundColor: C.surface, borderRadius: 14, overflow: "hidden", marginTop: 8 }}><View style={{ width: `${pct}%`, height: "100%", backgroundColor: pct > 100 ? C.red : C.gold }} /></View>;
}
function Macro({ label, v, t }: { label: string; v: number; t: number }) {
  return <View style={{ flex: 1 }}><Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono }}>{label} {Math.round(v)}/{t}g</Text><Bar value={v} target={t} /></View>;
}
function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={{ borderWidth: 1, borderColor: on ? C.gold : C.line, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 }}><Text style={{ color: on ? C.gold : C.muted, fontFamily: F.mono, fontSize: 11 }}>{label.toUpperCase()}</Text></Pressable>;
}
const lbl = { color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginTop: 16, marginBottom: 6 } as const;
const inp = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, fontFamily: F.body, fontSize: 15, marginTop: 6 } as const;
