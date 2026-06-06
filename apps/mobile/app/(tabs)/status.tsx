import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/useProfile";
import { levelProgress, RANKS } from "@/lib/game";
import { todayKey } from "@/lib/quests";
import { Seal } from "@/components/Seal";
import { C } from "@/lib/theme";

const CLASSES = ["Sentinel", "Scribe", "Crusader", "Pilgrim"];

export default function Status() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { profile } = useProfile();
  const userId = session?.user.id;
  const [sealedDays, setSealedDays] = useState<Set<string>>(new Set());
  const [cls, setCls] = useState<string>("");

  useEffect(() => { if (profile?.cls) setCls(String(profile.cls)); }, [profile?.cls]);
  useEffect(() => {
    if (!userId) return;
    supabase.from("day_history").select("day, status").eq("user_id", userId).then(({ data }) => {
      setSealedDays(new Set((data ?? []).filter((d) => d.status === "sealed").map((d) => String(d.day).slice(0, 10))));
    });
  }, [userId]);

  const xp = Number(profile?.xp ?? 0);
  const prog = levelProgress(xp);
  const streak = Number(profile?.streak ?? 0);
  const best = Number(profile?.best_streak ?? 0);
  const faith = profile?.faith === "seeker" ? "Seeker" : profile?.believer ? "Believer" : "Seeker";

  // last 28 days grid
  const days: string[] = [];
  for (let i = 27; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));

  async function pickClass(c: string) {
    setCls(c);
    if (userId) await supabase.from("profiles").update({ cls: c, char_class: c }).eq("user_id", userId);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 6 }}>
          <Seal size={64} />
          <Text style={{ color: C.ivory, fontSize: 22, fontWeight: "800", marginTop: 12 }}>{profile?.name || "Brother"}</Text>
          <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 3, marginTop: 2 }}>{prog.rank.toUpperCase()}</Text>
          {profile?.handle ? <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>@{String(profile.handle)}</Text> : null}
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <Stat label="LEVEL" value={String(prog.level)} />
          <Stat label="XP" value={String(xp)} />
          <Stat label="STREAK" value={`${streak}d`} />
          <Stat label="BEST" value={`${best}d`} />
        </View>

        {/* identity */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Tag label="FAITH" value={faith} />
          <Tag label="TRAINING" value={profile?.fitness_level ? String(profile.fitness_level) : "—"} />
        </View>

        {/* social actions */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <Action label="BROTHERS" onPress={() => router.push("/friends")} />
          <Action label="THE SYSTEM" onPress={() => router.push("/system")} />
          <Action label="GUILDS" onPress={() => router.push("/guilds")} />
        </View>
        <View style={{ marginTop: 10 }}>
          <Action label="INBOX" onPress={() => router.push("/notifications")} />
        </View>

        {/* history */}
        <Text style={sec}>LAST 28 DAYS</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {days.map((d) => {
            const on = sealedDays.has(d);
            const isToday = d === todayKey();
            return <View key={d} style={{ width: 26, height: 26, borderRadius: 3, backgroundColor: on ? C.gold : C.surface, borderWidth: isToday ? 1.5 : 1, borderColor: isToday ? C.goldLight : C.line }} />;
          })}
        </View>

        {/* class */}
        <Text style={sec}>YOUR CLASS</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {CLASSES.map((c) => (
            <Pressable key={c} onPress={() => pickClass(c)} style={{ paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: cls === c ? C.gold : C.line, backgroundColor: cls === c ? C.gold : "transparent", borderRadius: 2 }}>
              <Text style={{ color: cls === c ? C.black : C.muted, fontSize: 12, fontWeight: "700" }}>{c}</Text>
            </Pressable>
          ))}
        </View>

        {/* ascent */}
        <Text style={sec}>THE ASCENT</Text>
        {RANKS.map((r, i) => {
          const reached = RANKS.indexOf(prog.rank) >= i;
          const current = r === prog.rank;
          return (
            <View key={r} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
              <Text style={{ color: reached ? C.gold : C.muted, fontSize: 13, width: 28 }}>{reached ? "●" : "○"}</Text>
              <Text style={{ color: current ? C.gold : reached ? C.ivory : C.muted, fontSize: 15, fontWeight: current ? "800" : "400", flex: 1 }}>{r}</Text>
              {current && <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2 }}>YOU ARE HERE</Text>}
            </View>
          );
        })}

        <Pressable onPress={signOut} style={{ marginTop: 28, borderWidth: 1, borderColor: "rgba(192,58,58,0.4)", paddingVertical: 14, alignItems: "center", borderRadius: 2 }}>
          <Text style={{ color: C.red, fontSize: 12, letterSpacing: 2 }}>SIGN OUT</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={{ flex: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 10, borderRadius: 2 }}><Text style={{ color: C.muted, fontSize: 8, letterSpacing: 1 }}>{label}</Text><Text style={{ color: C.gold, fontSize: 15, fontWeight: "800", marginTop: 3 }} numberOfLines={1}>{value}</Text></View>;
}
function Tag({ label, value }: { label: string; value: string }) {
  return <View style={{ flex: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 12, borderRadius: 2 }}><Text style={{ color: C.muted, fontSize: 8, letterSpacing: 1 }}>{label}</Text><Text style={{ color: C.ivory, fontSize: 14, fontWeight: "600", marginTop: 3, textTransform: "capitalize" }}>{value}</Text></View>;
}
function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={{ flex: 1, borderWidth: 1, borderColor: C.gold, paddingVertical: 13, alignItems: "center", borderRadius: 2 }}><Text style={{ color: C.gold, fontSize: 10, letterSpacing: 1, fontWeight: "700" }}>{label}</Text></Pressable>;
}

const sec = { color: C.gold, fontSize: 10, letterSpacing: 3, marginTop: 26, marginBottom: 12 } as const;
