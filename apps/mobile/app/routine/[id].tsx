import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getRoutineExercises, deleteRoutine, logWorkout, inputKind, type RoutineExercise, type SetEntry } from "@/lib/fitness";
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

  useEffect(() => {
    if (!id) return;
    supabase.from("routines").select("name, focus, generated").eq("id", id).maybeSingle().then(({ data }) => { if (data) { setName(data.name); setGenerated(data.generated); } });
    getRoutineExercises(id).then((x) => {
      setItems(x);
      const init: Record<string, Row[]> = {};
      for (const it of x) {
        const kind = inputKind(it.exercise?.category, it.exercise?.equipment);
        const prefill = kind === "reps_weight" || kind === "reps" ? parseReps(it.reps) : "";
        init[it.id] = Array.from({ length: Math.max(1, it.sets || 1) }, () => emptyRow(prefill));
      }
      setLogs(init);
      setLoading(false);
    });
  }, [id]);

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
    await logWorkout(userId, name, Math.max(20, items.length * 8), sets, todayKey());
    setSaving(false);
    Alert.alert("Workout logged", sets.length ? `Logged ${sets.length} ${sets.length === 1 ? "set" : "sets"}. Your charts just grew.` : "Well fought. The body is forged.", [
      { text: "See progress", onPress: () => router.replace("/progress") },
      { text: "Done", onPress: () => router.back() },
    ]);
  }
  function confirmDelete() {
    Alert.alert("Delete routine?", "", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { if (id) await deleteRoutine(id); router.back(); } }]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        {!generated && <Pressable onPress={confirmDelete} hitSlop={10}><Text style={{ color: C.red, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>DELETE</Text></Pressable>}
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 0, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: C.ivory, fontSize: 26, fontFamily: F.head }}>{name}</Text>
        <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, marginTop: 4, marginBottom: 18 }}>{items.length} EXERCISES · LOG YOUR SETS</Text>

        {loading ? <ActivityIndicator color={C.gold} /> : items.map((it, i) => {
          const kind = inputKind(it.exercise?.category, it.exercise?.equipment);
          return (
            <View key={it.id} style={{ borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 12, borderRadius: 2, marginBottom: 10 }}>
              <Pressable onPress={() => router.push(`/exercise/${it.exercise_id}`)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 2, backgroundColor: C.surface, overflow: "hidden" }}>
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
                  </View>
                ))}
                <Pressable onPress={() => addSet(it.id)} hitSlop={6} style={{ alignSelf: "flex-start", marginTop: 2 }}>
                  <Text style={{ color: C.gold, fontSize: 10, fontFamily: F.mono, letterSpacing: 1 }}>＋ ADD {kind === "time_distance" || kind === "time" ? "ROUND" : "SET"}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {items.length > 0 && (
          <Pressable onPress={complete} disabled={saving} style={{ backgroundColor: C.gold, paddingVertical: 15, alignItems: "center", borderRadius: 2, marginTop: 14, opacity: saving ? 0.6 : 1 }}>
            <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>{saving ? "SAVING…" : "COMPLETE WORKOUT"}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const cell = { width: 60, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 8, paddingVertical: 7, borderRadius: 2, textAlign: "center" as const, fontFamily: F.mono, fontSize: 13 };
const unit = { color: C.muted, fontSize: 10, fontFamily: F.mono } as const;
