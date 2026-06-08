import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/useProfile";
import { levelProgress, RANKS } from "@/lib/game";
import { todayKey } from "@/lib/quests";
import { Seal } from "@/components/Seal";
import { C, F } from "@/lib/theme";
import { useTabBar } from "@/lib/tabbar";

const CLASSES = ["Sentinel", "Scribe", "Crusader", "Pilgrim"];

export default function Status() {
  const tb = useTabBar();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { profile, refresh } = useProfile();
  const userId = session?.user.id;
  const [sealedDays, setSealedDays] = useState<Set<string>>(new Set());
  const [cls, setCls] = useState<string>("");

  useEffect(() => { if (profile?.cls) setCls(String(profile.cls)); }, [profile?.cls]);
  useFocusEffect(useCallback(() => { refresh(); /* eslint-disable-next-line */ }, []));
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
  const faith = profile?.believer === "yes" ? "Believer" : profile?.believer === "seeking" || profile?.faith === "seeker" ? "Seeker" : "Believer";

  // last 28 days grid
  const days: string[] = [];
  for (let i = 27; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));

  async function pickClass(c: string) {
    setCls(c);
    if (userId) await supabase.from("profiles").update({ cls: c, char_class: c }).eq("user_id", userId);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView onScroll={tb?.onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 6 }}>
          {profile?.avatar_url ? (
            <View style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 1, borderColor: C.gold, overflow: "hidden" }}>
              <Image source={{ uri: String(profile.avatar_url) }} style={{ width: "100%", height: "100%" }} />
            </View>
          ) : <Seal size={64} />}
          <Text style={{ color: C.ivory, fontSize: 22, fontWeight: "800", fontFamily: F.head, marginTop: 12 }}>{profile?.name || "Brother"}</Text>
          <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 3, marginTop: 2 }}>{prog.rank.toUpperCase()}</Text>
          {profile?.handle ? <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>@{String(profile.handle)}</Text> : null}
          {profile?.bio ? <Text style={{ color: C.text, fontSize: 13, fontFamily: F.body, textAlign: "center", marginTop: 8, lineHeight: 19, maxWidth: 300 }}>{String(profile.bio)}</Text> : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
            {(() => { const verified = !!session?.user.email_confirmed_at; return (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: verified ? C.green : C.line, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
                <Text style={{ color: verified ? C.green : C.muted, fontSize: 10 }}>{verified ? "✓" : "○"}</Text>
                <Text style={{ color: verified ? C.green : C.muted, fontSize: 9, letterSpacing: 1.5, fontFamily: F.mono }}>{verified ? "VERIFIED" : "UNVERIFIED"}</Text>
              </View>
            ); })()}
            <Pressable onPress={() => router.push("/edit-profile")} style={{ borderWidth: 1, borderColor: C.gold, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 }}>
              <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 1.5, fontFamily: F.mono }}>EDIT PROFILE</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <Stat label="LEVEL" value={String(prog.level)} />
          <Stat label="XP" value={String(xp)} />
          <Stat label="STREAK" value={`${streak}d`} />
          <Stat label="BEST" value={`${best}d`} />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {(() => { const s = (profile?.stats ?? {}) as Record<string, number>; return (
            <>
              <Stat label="STR" value={String(s.STR ?? 0)} />
              <Stat label="AGI" value={String(s.AGI ?? 0)} />
              <Stat label="WIS" value={String(s.WIS ?? 0)} />
              <Stat label="MANA" value={String(s.MANA ?? 0)} />
            </>
          ); })()}
        </View>

        {/* identity */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Tag label="FAITH" value={faith} />
          <Tag label="TRAINING" value={profile?.fitness_level ? String(profile.fitness_level) : "—"} />
        </View>

        {/* menu (Brothers + Guilds moved to the Guild tab) */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <Action label="INBOX" onPress={() => router.push("/notifications")} />
          <Action label="THE SYSTEM" onPress={() => router.push("/system")} />
          <Action label="SETTINGS" onPress={() => router.push("/settings")} />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Action label="HONORS" onPress={() => router.push("/honors")} />
          <Action label="GIVEAWAY" onPress={() => router.push("/giveaway")} />
          <Action label="NOTES" onPress={() => router.push("/notes")} />
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
  return <View style={{ flex: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 10, borderRadius: 2 }}><Text style={{ color: C.muted, fontSize: 8, letterSpacing: 1 }}>{label}</Text><Text style={{ color: C.gold, fontSize: 15, fontWeight: "800", fontFamily: F.head, marginTop: 3 }} numberOfLines={1}>{value}</Text></View>;
}
function Tag({ label, value }: { label: string; value: string }) {
  return <View style={{ flex: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 12, borderRadius: 2 }}><Text style={{ color: C.muted, fontSize: 8, letterSpacing: 1 }}>{label}</Text><Text style={{ color: C.ivory, fontSize: 14, fontWeight: "600", marginTop: 3, textTransform: "capitalize" }}>{value}</Text></View>;
}
function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={{ flex: 1, borderWidth: 1, borderColor: C.gold, paddingVertical: 13, alignItems: "center", borderRadius: 2 }}><Text style={{ color: C.gold, fontSize: 10, letterSpacing: 1, fontWeight: "700" }}>{label}</Text></Pressable>;
}

const sec = { color: C.gold, fontSize: 10, letterSpacing: 3, marginTop: 26, marginBottom: 12 } as const;
