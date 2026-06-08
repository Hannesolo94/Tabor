import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getWorkouts, getPRs, setPR, deletePR, type WorkoutRow, type PR } from "@/lib/fitness";
import { C, F } from "@/lib/theme";

export default function History() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [lift, setLift] = useState("");
  const [value, setValue] = useState("");

  async function load() {
    if (!userId) return;
    setWorkouts(await getWorkouts(userId));
    setPrs(await getPRs(userId));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  async function addPR() {
    if (!userId || !lift.trim() || !value) return;
    await setPR(userId, lift.trim(), Number(value) || 0);
    setLift(""); setValue(""); load();
  }
  function removePR(p: PR) {
    Alert.alert("Remove PR?", p.lift, [{ text: "Cancel", style: "cancel" }, { text: "Remove", style: "destructive", onPress: async () => { if (userId) { await deletePR(userId, p.lift); load(); } } }]);
  }

  const totalMins = workouts.reduce((s, w) => s + (w.mins ?? 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Training Log</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {/* PRs */}
        <Text style={sec}>PERSONAL RECORDS</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <TextInput value={lift} onChangeText={setLift} placeholder="Lift (e.g. Bench)" placeholderTextColor={C.muted} style={[inp, { flex: 2 }]} />
          <TextInput value={value} onChangeText={(t) => setValue(t.replace(/[^0-9.]/g, ""))} placeholder="kg" placeholderTextColor={C.muted} keyboardType="numeric" style={[inp, { flex: 1 }]} />
          <Pressable onPress={addPR} style={{ backgroundColor: C.gold, paddingHorizontal: 16, justifyContent: "center", borderRadius: 12 }}><Text style={{ color: C.black, fontFamily: F.head }}>SET</Text></Pressable>
        </View>
        {prs.length === 0 ? <Text style={empty}>No records yet. Log your first lift.</Text> : prs.map((p) => (
          <Pressable key={p.lift} onLongPress={() => removePR(p)} delayLongPress={350} style={row}>
            <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.bodyMid }}>{p.lift}</Text>
            <Text style={{ color: C.gold, fontSize: 15, fontFamily: F.mono }}>{p.value} kg</Text>
          </Pressable>
        ))}

        {/* workout history */}
        <Text style={[sec, { marginTop: 26 }]}>RECENT SESSIONS · {workouts.length} · {totalMins} MIN</Text>
        {workouts.length === 0 ? <Text style={empty}>No sessions logged yet.</Text> : workouts.map((w) => (
          <View key={w.id} style={row}>
            <View>
              <Text style={{ color: C.ivory, fontSize: 14, fontFamily: F.body }}>{w.name}</Text>
              <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono }}>{w.day}</Text>
            </View>
            <Text style={{ color: C.text, fontSize: 13, fontFamily: F.mono }}>{w.mins ?? 0} min</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const sec = { color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginBottom: 10 } as const;
const inp = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, fontFamily: F.body, fontSize: 14 } as const;
const row = { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" };
const empty = { color: C.muted, fontSize: 13, fontFamily: F.body } as const;
