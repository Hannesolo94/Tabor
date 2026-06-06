import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/useProfile";
import { loadToday, toggleQuest, sealDay, type Quest } from "@/lib/quests";
import { levelProgress } from "@/lib/game";
import { C } from "@/lib/theme";

export default function Quests() {
  const { session } = useAuth();
  const { profile, loading: pLoading } = useProfile();
  const userId = session?.user.id;

  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpOffset, setXpOffset] = useState(0);
  const [sealed, setSealed] = useState(false);

  const barW = useRef(new Animated.Value(0)).current;
  const sealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!userId) return;
    loadToday(userId).then((q) => {
      setQuests(q);
      setSealed(q.length > 0 && q.every((x) => x.done));
      setLoading(false);
    });
  }, [userId]);

  const baseXp = Number(profile?.xp ?? 0);
  const prog = useMemo(() => levelProgress(baseXp + xpOffset), [baseXp, xpOffset]);
  const streak = Number(profile?.streak ?? 0);
  const allDone = quests.length > 0 && quests.every((q) => q.done);

  useEffect(() => {
    Animated.timing(barW, { toValue: prog.pct, duration: 600, useNativeDriver: false }).start();
  }, [prog.pct, barW]);

  useEffect(() => {
    if (allDone && !sealed) {
      setSealed(true);
      if (userId) sealDay(userId);
      Animated.spring(sealAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    }
  }, [allDone, sealed, userId, sealAnim]);

  async function onToggle(q: Quest) {
    if (!userId) return;
    const done = !q.done;
    setQuests((prev) => prev.map((x) => (x.id === q.id ? { ...x, done } : x)));
    setXpOffset((o) => o + (done ? q.xp : -q.xp));
    toggleQuest(userId, q, done).catch(() => {});
  }

  if (loading || pLoading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4 }}>[ THE SYSTEM ]</Text>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", marginTop: 6 }}>Daily Quest</Text>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{profile?.name ? `${profile.name}, the` : "The"} climb continues.{profile?.cls ? ` ${String(profile.cls)}.` : ""}</Text>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
          <Stat label="RANK" value={prog.rank} />
          <Stat label="LEVEL" value={String(prog.level)} />
          <Stat label="STREAK" value={`${streak}d`} />
        </View>

        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2 }}>XP</Text>
            <Text style={{ color: C.muted, fontSize: 10 }}>{prog.into} / {prog.need}</Text>
          </View>
          <View style={{ height: 8, backgroundColor: C.surface, borderRadius: 4, overflow: "hidden" }}>
            <Animated.View style={{ width: barW.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }), height: "100%", backgroundColor: C.gold }} />
          </View>
        </View>

        <Text style={{ color: C.ivory, fontSize: 13, letterSpacing: 3, marginTop: 28, marginBottom: 10 }}>TODAY'S QUESTS</Text>
        {quests.map((q) => (
          <Pressable key={q.id} onPress={() => onToggle(q)} style={{ borderWidth: 1, borderColor: q.done ? C.gold : C.line, backgroundColor: C.surface2, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", borderRadius: 2 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: q.done ? C.gold : C.muted, backgroundColor: q.done ? C.gold : "transparent", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
              {q.done && <Text style={{ color: C.black, fontSize: 13, fontWeight: "900" }}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2 }}>{q.pillar}</Text>
              <Text style={{ color: C.ivory, fontSize: 15, marginTop: 2, textDecorationLine: q.done ? "line-through" : "none" }}>{q.title}</Text>
            </View>
            <Text style={{ color: C.muted, fontSize: 12 }}>+{q.xp}</Text>
          </Pressable>
        ))}

        {sealed && (
          <Animated.View style={{ borderWidth: 1, borderColor: C.gold, padding: 20, marginTop: 8, alignItems: "center", borderRadius: 2, transform: [{ scale: sealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }], opacity: sealAnim }}>
            <Text style={{ color: C.gold, fontSize: 14, letterSpacing: 4 }}>[ DAY SEALED ]</Text>
            <Text style={{ color: C.text, fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 21 }}>The day is won. Your streak holds. Return tomorrow, brother.</Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 12, borderRadius: 2 }}>
      <Text style={{ color: C.muted, fontSize: 8, letterSpacing: 2 }}>{label}</Text>
      <Text style={{ color: C.gold, fontSize: 16, fontWeight: "800", marginTop: 3 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}
