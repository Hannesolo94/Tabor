import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, ActivityIndicator, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/useProfile";
import { loadToday, toggleQuest, sealDay, getDayFeedback, recordDayFeedback, CORE_KEYS, type Quest } from "@/lib/quests";
import { bookOrderFor } from "@/lib/scripture";
import { levelProgress } from "@/lib/game";
import { Seal } from "@/components/Seal";
import { C, F } from "@/lib/theme";
import { useTabBar } from "@/lib/tabbar";

export default function Quests() {
  const tb = useTabBar();
  const router = useRouter();
  const { session } = useAuth();
  const { profile, loading: pLoading } = useProfile();
  const userId = session?.user.id;

  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpOffset, setXpOffset] = useState(0);
  const [sealed, setSealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const barW = useRef(new Animated.Value(0)).current;
  const sealAnim = useRef(new Animated.Value(0)).current;
  const prevLevel = useRef<number | null>(null);
  const [rankUp, setRankUp] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadToday(userId).then((q) => {
      setQuests(q);
      setSealed(q.length > 0 && q.every((x) => x.done));
      setLoading(false);
    });
    getDayFeedback(userId).then(setFeedback);
  }, [userId]);
  // unread inbox badge for the bell, refreshed on focus
  useFocusEffect(useCallback(() => {
    if (!userId) return;
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("read", false).then(({ count }) => setUnread(count ?? 0));
  }, [userId]));

  const baseXp = Number(profile?.xp ?? 0);
  const prog = useMemo(() => levelProgress(baseXp + xpOffset), [baseXp, xpOffset]);
  const streak = Number(profile?.streak ?? 0);
  const core = quests.filter((q) => CORE_KEYS.includes(q.quest_key));
  const bonus = quests.filter((q) => !CORE_KEYS.includes(q.quest_key));
  const allDone = core.length > 0 && core.every((q) => q.done); // only the core gates the seal

  useEffect(() => {
    Animated.timing(barW, { toValue: prog.pct, duration: 600, useNativeDriver: false }).start();
  }, [prog.pct, barW]);

  // detect rank/level up (skip the first render so it doesn't fire on load)
  useEffect(() => {
    if (loading) return;
    if (prevLevel.current !== null && prog.level > prevLevel.current) setRankUp(true);
    prevLevel.current = prog.level;
  }, [prog.level, loading]);

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

  // tapping a quest does the relevant thing: open the passage, log the movement, or confirm
  async function openQuest(q: Quest) {
    const m = q.quest_key === "word" ? q.title.match(/^Read\s+(.+)\s+(\d+)$/) : null;
    if (m) {
      const order = await bookOrderFor(m[1]);
      const opts: { text: string; style?: "cancel"; onPress?: () => void }[] = [];
      if (order) opts.push({ text: "Open passage", onPress: () => router.push(`/read/${order}?c=${m[2]}`) });
      opts.push({ text: q.done ? "Mark not read" : "Mark as read", onPress: () => onToggle(q) });
      opts.push({ text: "Cancel", style: "cancel" });
      Alert.alert(q.title, "Take ground in the Word.", opts);
      return;
    }
    if (q.quest_key === "body") {
      Alert.alert(q.title, q.sub || "Crush it, then log it.", [
        { text: q.done ? "Mark not done" : "Mark complete", onPress: () => onToggle(q) },
        { text: "I did my own training", onPress: () => onToggle(q) },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    Alert.alert(q.title, q.sub || "", [
      { text: q.done ? "Mark not done" : "Mark complete", onPress: () => onToggle(q) },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  if (loading || pLoading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView onScroll={tb?.onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono }}>[ THE SYSTEM ]</Text>
          <Pressable onPress={() => router.push("/notifications")} hitSlop={10}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            {unread > 0 && <View style={{ position: "absolute", top: -3, right: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.red, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>{unread > 9 ? "9+" : unread}</Text></View>}
          </Pressable>
        </View>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", fontFamily: F.head, marginTop: 6 }}>Daily Quest</Text>
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

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28, marginBottom: 10 }}>
          <Text style={{ color: C.ivory, fontSize: 13, letterSpacing: 3 }}>TODAY'S QUESTS</Text>
          <Text style={{ color: allDone ? C.gold : C.muted, fontSize: 10, fontFamily: F.mono }}>{core.filter((q) => q.done).length}/{core.length} CLEARED</Text>
        </View>
        {core.map((q) => <QuestRow key={q.id} q={q} onOpen={openQuest} onToggle={onToggle} />)}
        {!allDone && core.length > 0 && (
          <Text style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 4 }}>Clear all {core.length} to seal the day and hold your streak.</Text>
        )}
        {bonus.length > 0 && (
          <>
            <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 3, fontFamily: F.mono, marginTop: 26, marginBottom: 10 }}>BONUS DISCIPLINES · OPTIONAL</Text>
            {bonus.map((q) => <QuestRow key={q.id} q={q} onOpen={openQuest} onToggle={onToggle} />)}
          </>
        )}

        {sealed && (
          <Animated.View style={{ borderWidth: 1, borderColor: C.gold, padding: 20, marginTop: 8, alignItems: "center", borderRadius: 2, transform: [{ scale: sealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }], opacity: sealAnim }}>
            <Text style={{ color: C.gold, fontSize: 14, letterSpacing: 4, fontFamily: F.mono }}>[ DAY SEALED ]</Text>
            <Text style={{ color: C.text, fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 21 }}>The day is won. Your streak holds. Return tomorrow, brother.</Text>
            {!feedback ? (
              <View style={{ marginTop: 18, alignItems: "center" }}>
                <Text style={{ color: C.muted, fontSize: 12, marginBottom: 10 }}>How did today's training feel?</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {([["easy", "Too easy"], ["right", "Just right"], ["hard", "Too hard"]] as const).map(([sig, label]) => (
                    <Pressable key={sig} onPress={() => { setFeedback(sig); if (userId) recordDayFeedback(userId, sig).catch(() => {}); }} style={{ borderWidth: 1, borderColor: C.line, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 2 }}>
                      <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono }}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 14, textAlign: "center" }}>{feedback === "easy" ? "Noted. Tomorrow climbs a little higher." : feedback === "hard" ? "Noted. We ease the load tomorrow." : "Locked in. Hold the line."}</Text>
            )}
          </Animated.View>
        )}
      </ScrollView>

      <Modal visible={rankUp} transparent animationType="fade" onRequestClose={() => setRankUp(false)}>
        <Pressable onPress={() => setRankUp(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center", padding: 30 }}>
          <Seal size={110} />
          <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 6, fontFamily: F.mono, marginTop: 24 }}>[ RANK ATTAINED ]</Text>
          <Text style={{ color: C.ivory, fontSize: 40, fontFamily: F.head, marginTop: 10, textAlign: "center" }}>{prog.rank}</Text>
          <Text style={{ color: C.text, fontSize: 15, fontFamily: F.body, marginTop: 14, textAlign: "center", lineHeight: 22 }}>Level {prog.level}. The fire grows, Son of Fire. Keep climbing.</Text>
          <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, marginTop: 28 }}>TAP TO CONTINUE</Text>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function QuestRow({ q, onOpen, onToggle }: { q: Quest; onOpen: (q: Quest) => void; onToggle: (q: Quest) => void }) {
  return (
    <Pressable onPress={() => onOpen(q)} style={{ borderWidth: 1, borderColor: q.done ? C.gold : C.line, backgroundColor: C.surface2, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", borderRadius: 2 }}>
      {/* tap the circle to quick-toggle; tap the card to open the action */}
      <Pressable onPress={() => onToggle(q)} hitSlop={10} style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: q.done ? C.gold : C.muted, backgroundColor: q.done ? C.gold : "transparent", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
        {q.done && <Text style={{ color: C.black, fontSize: 13, fontWeight: "900" }}>✓</Text>}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 2 }}>{q.pillar}</Text>
        <Text style={{ color: C.ivory, fontSize: 15, marginTop: 2, textDecorationLine: q.done ? "line-through" : "none" }}>{q.title}</Text>
        {q.sub ? <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{q.sub}</Text> : null}
      </View>
      <Text style={{ color: C.muted, fontSize: 11, marginLeft: 8 }}>+{q.xp}</Text>
      <Text style={{ color: C.gold, fontSize: 18, marginLeft: 8 }}>›</Text>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 12, borderRadius: 2 }}>
      <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2 }}>{label}</Text>
      <Text style={{ color: C.gold, fontSize: 16, fontWeight: "800", fontFamily: F.head, marginTop: 3 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}
