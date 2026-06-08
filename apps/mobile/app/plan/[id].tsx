import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getPlan, getProgress, setPlanDay, bookOrderFor, type Plan, type PlanEntry } from "@/lib/scripture";
import { C, F } from "@/lib/theme";

export default function PlanDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [done, setDone] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!id) return;
    const p = await getPlan(id); setPlan(p);
    if (userId) { const pr = await getProgress(userId); setDone(pr[id] ?? 0); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, userId]);

  async function openDay(entry: PlanEntry) {
    if (userId && id && entry.day > done) { await setPlanDay(userId, id, entry.day); setDone(entry.day); }
    const order = await bookOrderFor(entry.book);
    if (order) router.push(`/read/${order}?c=${entry.chapter}`);
  }

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;
  if (!plan) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><Text style={{ color: C.muted }}>Not found.</Text></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 0, paddingBottom: 40 }}>
        {plan.seeker ? <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2, fontFamily: F.mono, marginBottom: 4 }}>SEEKER TRACK</Text> : null}
        <Text style={{ color: C.ivory, fontSize: 26, fontFamily: F.head }}>{plan.title}</Text>
        <Text style={{ color: C.muted, fontSize: 13, fontFamily: F.body, marginTop: 4 }}>{plan.subtitle}</Text>
        <View style={{ height: 6, backgroundColor: C.surface, borderRadius: 14, marginTop: 14, overflow: "hidden" }}>
          <View style={{ width: `${Math.round((done / plan.days) * 100)}%`, height: "100%", backgroundColor: C.gold }} />
        </View>
        <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, marginTop: 6, marginBottom: 18 }}>{done}/{plan.days} DAYS COMPLETE</Text>

        {plan.entries.map((e) => {
          const isDone = e.day <= done;
          const isNext = e.day === done + 1;
          return (
            <Pressable key={e.day} onPress={() => openDay(e)} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: isNext ? C.gold : C.line, backgroundColor: C.surface2, padding: 14, borderRadius: 12, marginBottom: 10 }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: isDone ? C.gold : C.muted, backgroundColor: isDone ? C.gold : "transparent", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: isDone ? C.black : C.muted, fontSize: 12, fontFamily: F.head }}>{isDone ? "✓" : e.day}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.bodyMid }}>{e.title}</Text>
                <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, marginTop: 2 }}>{e.book} {e.chapter}</Text>
                {e.reflection ? <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body, marginTop: 4 }}>{e.reflection}</Text> : null}
              </View>
              <Text style={{ color: C.gold, fontSize: 16 }}>›</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
