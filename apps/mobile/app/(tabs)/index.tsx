import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "@/lib/useProfile";
import { levelProgress } from "@/lib/game";
import { C } from "@/lib/theme";

const QUESTS = [
  { id: "word", pillar: "SCRIPTURE RAID", title: "Read today's passage", xp: 30 },
  { id: "body", pillar: "FITNESS GUILD", title: "Complete a training set", xp: 40 },
  { id: "brother", pillar: "BROTHERHOOD", title: "Check in with the guild", xp: 20 },
];

export default function Quests() {
  const { profile, loading } = useProfile();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const baseXp = Number(profile?.xp ?? 0);
  const earned = QUESTS.reduce((s, q) => s + (done[q.id] ? q.xp : 0), 0);
  const prog = useMemo(() => levelProgress(baseXp + earned), [baseXp, earned]);
  const streak = Number(profile?.streak ?? 0);
  const allDone = QUESTS.every((q) => done[q.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4 }}>[ THE SYSTEM ]</Text>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", marginTop: 6 }}>Daily Quest</Text>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{loading ? "Reading your status..." : `Welcome back${profile?.name ? `, ${profile.name}` : ""}. The climb continues.`}</Text>

        {/* status bar */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
          <Stat label="RANK" value={prog.rank} />
          <Stat label="LEVEL" value={String(prog.level)} />
          <Stat label="STREAK" value={`${streak}d`} />
        </View>

        {/* xp bar */}
        <View style={{ marginTop: 18 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2 }}>XP</Text>
            <Text style={{ color: C.muted, fontSize: 10 }}>{prog.into} / {prog.need}</Text>
          </View>
          <View style={{ height: 8, backgroundColor: C.surface, borderRadius: 4, overflow: "hidden" }}>
            <View style={{ width: `${Math.round(prog.pct * 100)}%`, height: "100%", backgroundColor: C.gold }} />
          </View>
        </View>

        {/* quests */}
        <Text style={{ color: C.ivory, fontSize: 13, letterSpacing: 3, marginTop: 28, marginBottom: 10 }}>TODAY'S QUESTS</Text>
        {QUESTS.map((q) => {
          const on = !!done[q.id];
          return (
            <Pressable key={q.id} onPress={() => setDone((d) => ({ ...d, [q.id]: !d[q.id] }))} style={{ borderWidth: 1, borderColor: on ? C.gold : C.line, backgroundColor: C.surface2, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", borderRadius: 2 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? C.gold : C.muted, backgroundColor: on ? C.gold : "transparent", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                {on && <Text style={{ color: C.black, fontSize: 13, fontWeight: "900" }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2 }}>{q.pillar}</Text>
                <Text style={{ color: C.ivory, fontSize: 15, marginTop: 2, textDecorationLine: on ? "line-through" : "none" }}>{q.title}</Text>
              </View>
              <Text style={{ color: C.muted, fontSize: 12 }}>+{q.xp}</Text>
            </Pressable>
          );
        })}

        {allDone && (
          <View style={{ borderWidth: 1, borderColor: C.gold, padding: 16, marginTop: 8, alignItems: "center", borderRadius: 2 }}>
            <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 3 }}>[ DAY SEALED ]</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 6, textAlign: "center" }}>The day is won. Saving to your record arrives in the next build.</Text>
          </View>
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
