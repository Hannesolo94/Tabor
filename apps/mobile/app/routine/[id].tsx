import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getRoutineExercises, deleteRoutine, removeExerciseFromRoutine, moveRoutineExercises, logWorkout, saveRoutineSets, getLatestBodyweight, workoutXp, estimateCalories, grantWorkoutXp, inputKind, type RoutineExercise, type SetEntry, type SavedSet } from "@/lib/fitness";
import { useActionSheet } from "@/components/ActionSheet";
import { Celebration } from "@/components/Celebration";
import { todayKey } from "@/lib/quests";
import { C, F } from "@/lib/theme";

type Row = { reps: string; weight: string; time: string; distance: string };
const emptyRow = (reps = ""): Row => ({ reps, weight: "", time: "", distance: "" });

function parseReps(r: string): string {
  const m = (r || "").match(/\d+/g);
  if (!m) return "";
  return m.length >= 2 ? String(Math.round((Number(m[0]) + Number(m[1])) / 2)) : m[0];
}

export default function RoutineDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [name, setName] = useState("Routine");
  const [generated, setGenerated] = useState(true);
  const [items, setItems] = useState<RoutineExercise[]>([]);
  const [logs, setLogs] = useState<Record<string, Row[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bodyweight, setBodyweight] = useState<number | null>(null);
  const [celebrate, setCelebrate] = useState<{ sets: SetEntry[]; xp: number } | null>(null);
  const [mins, setMins] = useState("");
  const sheet = useActionSheet();
  const rowToSaved = (r: Row): SavedSet => ({ reps: r.reps, weight: r.weight, time: r.time, distance: r.distance });

  useEffect(() => {
    if (!id) return;
    supabase.from("routines").select("name, focus, generated").eq("id", id).maybeSingle().then(({ data }) => { if (data) { setName(data.name); setGenerated(data.generated); } });
    getRoutineExercises(id).then((x) => {
      setItems(x);
      const init: Record<string, Row[]> = {};
      for (const it of x) {
        const kind = inputKind(it.exercise?.category, it.exercise?.equipment);
        if (it.last_sets && it.last_sets.length) {
          // load last session's numbers back so the user can match or beat them
          init[it.id] = it.last_sets.map((s) => ({ reps: s.reps ?? "", weight: s.weight ?? "", time: s.time ?? "", distance: s.distance ?? "" }));
        } else {
          const prefill = kind === "reps_weight" || kind === "reps" ? parseReps(it.reps) : "";
          init[it.id] = Array.from({ length: Math.max(1, it.sets || 1) }, () => emptyRow(prefill));
        }
      }
      setLogs(init);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => { if (userId) getLatestBodyweight(userId).then(setBodyweight); }, [userId]);

  function setCell(itemId: string, idx: number, field: keyof Row, val: string) {
    setLogs((prev) => {
      const rows = [...(prev[itemId] ?? [])];
      rows[idx] = { ...rows[idx], [field]: val.replace(/[^0-9.]/g, "") };
      return { ...prev, [itemId]: rows };
    });
  }
  function addSet(itemId: string) {
    setLogs((prev) => {
      const rows = [...(prev[itemId] ?? [])];
      const last = rows[rows.length - 1];
      rows.push({ reps: last?.reps ?? "", weight: last?.weight ?? "", time: last?.time ?? "", distance: last?.distance ?? "" });
      return { ...prev, [itemId]: rows };
    });
  }
  function removeSet(itemId: string, idx: number) {
    setLogs((prev) => {
      const rows = [...(prev[itemId] ?? [])];
      if (rows.length <= 1) return prev;
      rows.splice(idx, 1);
      return { ...prev, [itemId]: rows };
    });
  }
  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    await moveRoutineExercises(next.map((x) => x.id));
  }
  function removeExercise(it: RoutineExercise) {
    sheet({
      title: `Remove ${it.exercise?.name ?? "exercise"}?`,
      message: "It will be taken out of this routine.",
      actions: [{ label: "Remove exercise", style: "destructive", onPress: async () => {
        setItems((prev) => prev.filter((x) => x.id !== it.id));
        setLogs((prev) => { const n = { ...prev }; delete n[it.id]; return n; });
        await removeExerciseFromRoutine(it.id);
      } }],
    });
  }

  async function complete() {
    if (!userId || saving) return;
    setSaving(true);
    const sets: SetEntry[] = [];
    for (const it of items) {
      const kind = inputKind(it.exercise?.category, it.exercise?.equipment);
      (logs[it.id] ?? []).forEach((row, i) => {
        const base = { exercise_id: it.exercise_id, exercise_name: it.exercise?.name ?? "Exercise", set_index: i + 1, reps: 0, weight: 0 };
        if (kind === "time_distance") {
          const time = parseFloat(row.time) || 0, dist = parseFloat(row.distance) || 0;
          if (time > 0 || dist > 0) sets.push({ ...base, duration_sec: Math.round(time * 60), distance_m: Math.round(dist * 1000) });
        } else if (kind === "time") {
          const time = parseFloat(row.time) || 0;
          if (time > 0) sets.push({ ...base, duration_sec: Math.round(time) });
        } else {
          const reps = parseInt(row.reps, 10);
          if (reps > 0) sets.push({ ...base, reps, weight: kind === "reps_weight" ? parseFloat(row.weight) || 0 : 0 });
        }
      });
    }
    // persist the entered numbers so they load back next session (progressive overload)
    await saveRoutineSets(items.map((it) => ({ id: it.id, sets: (logs[it.id] ?? []).map(rowToSaved) })));
    const xp = workoutXp(sets.length);
    await grantWorkoutXp(xp);
    setSaving(false);
    setMins(String(Math.max(20, items.length * 8)));
    setCelebrate({ sets, xp });
  }

  async function finishCelebration(logEffort: boolean) {
    const cel = celebrate;
    setCelebrate(null);
    if (!userId || !cel) return;
    const m = parseInt(mins, 10) || Math.max(20, items.length * 8);
    await logWorkout(userId, name, m, cel.sets, todayKey(), logEffort ? estimateCalories(m, bodyweight) : null);
    router.replace("/progress");
  }
  async function saveOnly() {
    await saveRoutineSets(items.map((it) => ({ id: it.id, sets: (logs[it.id] ?? []).map(rowToSaved) })));
    sheet({ title: "Saved", message: "Your numbers are saved. They will load back next time so you can match or beat them.", actions: [{ label: "Got it", style: "cancel" }] });
  }
  function confirmDelete() {
    sheet({
      title: "Delete routine?",
      message: "This removes the whole routine and its exercises.",
      actions: [{ label: "Delete routine", style: "destructive", onPress: async () => { if (id) await deleteRoutine(id); router.back(); } }],
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <Pressable onPress={saveOnly} hitSlop={10}><Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>SAVE</Text></Pressable>
          {!generated && <Pressable onPress={confirmDelete} hitSlop={10}><Text style={{ color: C.red, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>DELETE</Text></Pressable>}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 0, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: C.ivory, fontSize: 26, fontFamily: F.head }}>{name}</Text>
        <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, marginTop: 4, marginBottom: 18 }}>{items.length} EXERCISES · LOG YOUR SETS</Text>

        {loading ? <ActivityIndicator color={C.gold} /> : items.map((it, i) => {
          const kind = inputKind(it.exercise?.category, it.exercise?.equipment);
          return (
            <View key={it.id} style={{ borderWidth: 1, borderColor: C.glassBorder, backgroundColor: C.surface2, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 6, padding: 12, borderRadius: 12, marginBottom: 10 }}>
              <Pressable onPress={() => router.push(`/exercise/${it.exercise_id}`)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: C.surface, overflow: "hidden" }}>
                  {it.exercise?.image_url ? <Image source={{ uri: it.exercise.image_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.ivory, fontSize: 14, fontFamily: F.bodyMid }} numberOfLines={1}>{i + 1}. {it.exercise?.name ?? "Exercise"}</Text>
                  <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, marginTop: 3 }}>{kind === "time_distance" ? "CARDIO · TIME + DISTANCE" : kind === "time" ? "HOLD · TIME" : `${it.sets} × ${it.reps} · ${it.rest}s rest`}</Text>
                </View>
                <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono }}>view ›</Text>
              </Pressable>

              <View style={{ marginTop: 12, gap: 7 }}>
                {(logs[it.id] ?? []).map((row, idx) => (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, width: 40 }}>{kind === "time_distance" || kind === "time" ? "ROUND" : "SET"} {idx + 1}</Text>
                    {kind === "time_distance" ? (
                      <>
                        <TextInput value={row.time} onChangeText={(v) => setCell(it.id, idx, "time", v)} keyboardType="numeric" placeholder="min" placeholderTextColor={C.muted} style={cell} />
                        <Text style={unit}>min</Text>
                        <TextInput value={row.distance} onChangeText={(v) => setCell(it.id, idx, "distance", v)} keyboardType="numeric" placeholder="km" placeholderTextColor={C.muted} style={cell} />
                        <Text style={unit}>km</Text>
                      </>
                    ) : kind === "time" ? (
                      <>
                        <TextInput value={row.time} onChangeText={(v) => setCell(it.id, idx, "time", v)} keyboardType="numeric" placeholder="sec" placeholderTextColor={C.muted} style={cell} />
                        <Text style={unit}>sec hold</Text>
                      </>
                    ) : (
                      <>
                        <TextInput value={row.reps} onChangeText={(v) => setCell(it.id, idx, "reps", v)} keyboardType="numeric" placeholder="reps" placeholderTextColor={C.muted} style={cell} />
                        <Text style={unit}>reps</Text>
                        {kind === "reps_weight" && (
                          <>
                            <Text style={{ color: C.muted, fontSize: 13 }}>×</Text>
                            <TextInput value={row.weight} onChangeText={(v) => setCell(it.id, idx, "weight", v)} keyboardType="numeric" placeholder="0" placeholderTextColor={C.muted} style={cell} />
                            <Text style={unit}>kg</Text>
                          </>
                        )}
                      </>
                    )}
                    {(logs[it.id]?.length ?? 0) > 1 && (
                      <Pressable onPress={() => removeSet(it.id, idx)} hitSlop={8} style={{ marginLeft: "auto", paddingHorizontal: 2 }}>
                        <Text style={{ color: C.muted, fontSize: 18 }}>×</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
                <Pressable onPress={() => addSet(it.id)} hitSlop={6} style={{ alignSelf: "flex-start", marginTop: 2 }}>
                  <Text style={{ color: C.gold, fontSize: 10, fontFamily: F.mono, letterSpacing: 1 }}>＋ ADD {kind === "time_distance" || kind === "time" ? "ROUND" : "SET"}</Text>
                </Pressable>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line }}>
                <Pressable onPress={() => move(i, -1)} disabled={i === 0} hitSlop={8}><Text style={{ color: i === 0 ? C.line : C.gold, fontSize: 19 }}>↑</Text></Pressable>
                <Pressable onPress={() => move(i, 1)} disabled={i === items.length - 1} hitSlop={8}><Text style={{ color: i === items.length - 1 ? C.line : C.gold, fontSize: 19 }}>↓</Text></Pressable>
                <Text style={{ color: C.muted, fontSize: 9, fontFamily: F.mono, letterSpacing: 1 }}>REORDER</Text>
                <Pressable onPress={() => removeExercise(it)} hitSlop={8} style={{ marginLeft: "auto" }}><Text style={{ color: C.red, fontSize: 10, fontFamily: F.mono, letterSpacing: 1 }}>✕ REMOVE</Text></Pressable>
              </View>
            </View>
          );
        })}

        {items.length > 0 && (
          <Pressable onPress={complete} disabled={saving} style={{ backgroundColor: C.gold, paddingVertical: 15, alignItems: "center", borderRadius: 12, marginTop: 14, opacity: saving ? 0.6 : 1 }}>
            <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>{saving ? "SAVING…" : "COMPLETE WORKOUT"}</Text>
          </Pressable>
        )}
      </ScrollView>

      <Celebration
        visible={!!celebrate}
        xp={celebrate?.xp}
        title="[ WORKOUT FORGED ]"
        message="Your numbers are saved. Next session they load back, so you can match or beat them."
        doneLabel="Save & see progress"
        onDone={() => finishCelebration(true)}
      >
        <View style={{ borderWidth: 1, borderColor: C.glassBorder, borderRadius: 12, padding: 14, backgroundColor: C.glassSoft }}>
          <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, letterSpacing: 1, marginBottom: 9 }}>LOG YOUR TIME · FOR YOUR CHARTS</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TextInput value={mins} onChangeText={(v) => setMins(v.replace(/[^0-9]/g, ""))} keyboardType="numeric" placeholder="min" placeholderTextColor={C.muted} style={cell} />
            <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.mono }}>min</Text>
            <Text style={{ color: C.gold, fontSize: 13, fontFamily: F.mono, marginLeft: "auto" }}>≈ {estimateCalories(parseInt(mins, 10) || 0, bodyweight)} kcal</Text>
          </View>
          <Pressable onPress={() => finishCelebration(false)} hitSlop={6} style={{ marginTop: 12, alignSelf: "center" }}>
            <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>SKIP · JUST LOG THE SETS</Text>
          </Pressable>
        </View>
      </Celebration>
    </SafeAreaView>
  );
}

const cell = { width: 60, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 8, paddingVertical: 7, borderRadius: 12, textAlign: "center" as const, fontFamily: F.mono, fontSize: 13 };
const unit = { color: C.muted, fontSize: 10, fontFamily: F.mono } as const;
