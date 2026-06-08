import { useCallback, useState, type ReactNode } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getVolumeByDay, getTrackedLifts, getLiftProgress, getBodyweightSeries, logBodyweight, getPRs, type DayPoint, type PR } from "@/lib/fitness";
import { todayKey } from "@/lib/quests";
import { LineChart, BarChart } from "@/components/Charts";
import { C, F } from "@/lib/theme";

export default function Progress() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState<DayPoint[]>([]);
  const [lifts, setLifts] = useState<string[]>([]);
  const [lift, setLift] = useState<string | null>(null);
  const [liftSeries, setLiftSeries] = useState<DayPoint[]>([]);
  const [bw, setBw] = useState<DayPoint[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [bwInput, setBwInput] = useState("");

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    (async () => {
      const [v, l, b, p] = await Promise.all([getVolumeByDay(userId), getTrackedLifts(userId), getBodyweightSeries(userId), getPRs(userId)]);
      setVolume(v); setLifts(l); setBw(b); setPrs(p);
      const first = l[0] ?? null; setLift(first);
      if (first) setLiftSeries(await getLiftProgress(userId, first));
      setLoading(false);
    })();
  }, [userId]));

  async function pickLift(name: string) { setLift(name); if (userId) setLiftSeries(await getLiftProgress(userId, name)); }
  async function saveBw() {
    const w = parseFloat(bwInput); if (!w || !userId) return;
    await logBodyweight(userId, w, todayKey()); setBwInput("");
    setBw(await getBodyweightSeries(userId));
  }

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontWeight: "800", fontFamily: F.head }}>Progress</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Section title="TRAINING VOLUME · 30 DAYS" hint="total reps × weight lifted per day">
          <BarChart data={volume} unit=" kg" />
        </Section>

        <Section title="STRENGTH · EST. 1RM" hint={lift ? lift : "your tracked lifts appear here"}>
          {lifts.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }} contentContainerStyle={{ gap: 6 }}>
              {lifts.map((l) => (
                <Pressable key={l} onPress={() => pickLift(l)} style={{ paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: lift === l ? C.gold : C.line, borderRadius: 12 }}>
                  <Text style={{ color: lift === l ? C.gold : C.muted, fontSize: 10, fontFamily: F.mono }} numberOfLines={1}>{l}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <LineChart data={liftSeries} unit=" kg" />
        </Section>

        <Section title="BODYWEIGHT" hint="log today's weight to track the trend">
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <TextInput value={bwInput} onChangeText={setBwInput} keyboardType="numeric" placeholder="e.g. 82.5" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 }} />
            <Pressable onPress={saveBw} style={{ backgroundColor: C.gold, paddingHorizontal: 18, justifyContent: "center", borderRadius: 12 }}><Text style={{ color: C.black, fontFamily: F.head }}>LOG</Text></Pressable>
          </View>
          <LineChart data={bw} unit=" kg" color={C.ivory} />
        </Section>

        <Section title="PERSONAL RECORDS" hint="best estimated 1-rep max">
          {prs.length === 0 ? <Text style={{ color: C.muted, fontFamily: F.body, fontSize: 13 }}>No records yet. They set automatically as you log weighted sets.</Text> :
            prs.map((p) => (
              <View key={p.lift} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
                <Text style={{ color: C.ivory, fontSize: 14, flex: 1 }} numberOfLines={1}>{p.lift}</Text>
                <Text style={{ color: C.gold, fontSize: 14, fontWeight: "800", fontFamily: F.head }}>{p.value} kg</Text>
              </View>
            ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 22, borderWidth: 1, borderColor: C.glassBorder, backgroundColor: C.surface2, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 6, borderRadius: 12, padding: 14 }}>
      <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono }}>{title}</Text>
      {hint ? <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.body, marginTop: 2, marginBottom: 10 }}>{hint}</Text> : <View style={{ height: 10 }} />}
      {children}
    </View>
  );
}
