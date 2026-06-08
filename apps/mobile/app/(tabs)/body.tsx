import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, TextInput, ActivityIndicator, FlatList, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/useProfile";
import { useTabBar } from "@/lib/tabbar";
import { supabase } from "@/lib/supabase";
import { todayKey } from "@/lib/quests";
import { listExercises, generateProgram, getRoutines, renameRoutine, duplicateRoutine, deleteRoutine, moveRoutine, MUSCLE_GROUPS, type Exercise, type Routine } from "@/lib/fitness";
import { TabataTimer } from "@/components/TabataTimer";
import { useActionSheet } from "@/components/ActionSheet";
import { C, F } from "@/lib/theme";

const GOALS = [{ v: "strength", l: "Strength" }, { v: "muscle", l: "Muscle" }, { v: "fatloss", l: "Fat loss" }, { v: "endurance", l: "Endurance" }];
const EQUIP = [{ v: "none", l: "Bodyweight" }, { v: "dumbbells", l: "Dumbbells" }, { v: "full", l: "Full gym" }];

export default function Body() {
  const tb = useTabBar();
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useProfile();
  const userId = session?.user.id;
  const [tab, setTab] = useState<"program" | "library" | "timer">("program");

  async function logWorkout(name = "Workout", mins = 15) {
    if (!userId) return;
    await supabase.from("workouts").insert({ user_id: userId, name, mins, day: todayKey() });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono }}>[ FITNESS GUILD ]</Text>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", fontFamily: F.head, marginTop: 6 }}>The Body</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14, marginBottom: 10 }}>
          {(["program", "library", "timer"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: tab === t ? C.gold : C.line, backgroundColor: tab === t ? C.gold : "transparent", borderRadius: 2 }}>
              <Text style={{ color: tab === t ? C.black : C.ivory, fontSize: 12, letterSpacing: 1, fontFamily: F.headMid }}>{t === "program" ? "PROGRAM" : t === "library" ? "LIBRARY" : "TABATA"}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
          <QuickLink icon="🍽" label="FUEL" onPress={() => router.push("/fuel")} />
          <QuickLink icon="📋" label="LOG" onPress={() => router.push("/history")} />
          <QuickLink icon="📈" label="PROGRESS" onPress={() => router.push("/progress")} accent />
        </View>
      </View>

      {tab === "program" && <ProgramTab userId={userId} profile={profile} onScroll={tb?.onScroll} router={router} />}
      {tab === "library" && <LibraryTab onScroll={tb?.onScroll} router={router} />}
      {tab === "timer" && (
        <ScrollView onScroll={tb?.onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <TabataTimer userId={userId} onComplete={() => logWorkout("Tabata Session", 4)} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function ProgramTab({ userId, profile, onScroll, router }: { userId?: string; profile: any; onScroll: any; router: any }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [goal, setGoal] = useState("muscle");
  const [equip, setEquip] = useState("full");
  const [days, setDays] = useState(3);
  const [renaming, setRenaming] = useState<Routine | null>(null);
  const [renameText, setRenameText] = useState("");
  const sheet = useActionSheet();

  async function load() { if (userId) setRoutines(await getRoutines(userId)); setLoading(false); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);
  // re-pull when returning to this screen (e.g. after making a routine from an exercise)
  useFocusEffect(useCallback(() => { if (userId) getRoutines(userId).then(setRoutines); }, [userId]));
  // pre-fill from onboarding answers
  useEffect(() => {
    if (!profile) return;
    if (profile.equipment) setEquip(profile.equipment);
    if (Array.isArray(profile.goals) && profile.goals[0]) setGoal(profile.goals[0]);
    if (profile.days_per_week) setDays(profile.days_per_week);
  }, [profile]);

  async function generate() {
    if (!userId) return;
    setBusy(true);
    await generateProgram(userId, { fitness_level: profile?.fitness_level ?? "beginner", equipment: equip, goals: goal, days });
    await load();
    setBusy(false);
  }

  function manage(r: Routine) {
    sheet({
      title: r.name,
      actions: [
        { label: "Rename", onPress: () => { setRenameText(r.name); setRenaming(r); } },
        { label: "Duplicate", onPress: async () => { if (userId) { await duplicateRoutine(userId, r.id); load(); } } },
        { label: "Delete routine", style: "destructive", onPress: () => sheet({ title: "Delete routine?", message: r.name, actions: [{ label: "Delete", style: "destructive", onPress: async () => { await deleteRoutine(r.id); load(); } }, { label: "Cancel", style: "cancel" }] }) },
        { label: "Cancel", style: "cancel" },
      ],
    });
  }
  async function reorder(section: Routine[], index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= section.length) return;
    const next = [...section];
    [next[index], next[j]] = [next[j], next[index]];
    await moveRoutine(next.map((r) => r.id));
    load();
  }
  async function saveRename() {
    if (renaming && renameText.trim()) { await renameRoutine(renaming.id, renameText.trim()); setRenaming(null); load(); }
  }

  if (loading) return <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />;

  const generated = routines.filter((r) => r.generated);
  const custom = routines.filter((r) => !r.generated);
  const routineCard = (r: Routine, section: Routine[], index: number) => (
    <View key={r.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
      <Pressable onPress={() => router.push(`/routine/${r.id}`)} onLongPress={() => manage(r)} delayLongPress={300} style={{ flex: 1, borderWidth: 1, borderColor: r.generated ? C.line : C.gold, backgroundColor: C.surface2, padding: 16, borderRadius: 2, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.ivory, fontSize: 16, fontFamily: F.headMid }}>{r.name}</Text>
          <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, marginTop: 3 }}>{(r.focus || "").toUpperCase()}</Text>
        </View>
        <Pressable onPress={() => manage(r)} hitSlop={14} style={{ paddingHorizontal: 10, paddingVertical: 8 }}><Text style={{ color: C.gold, fontSize: 22 }}>⋯</Text></Pressable>
      </Pressable>
      {section.length > 1 && (
        <View style={{ marginLeft: 8, alignItems: "center" }}>
          <Pressable onPress={() => reorder(section, index, -1)} hitSlop={8} disabled={index === 0}><Text style={{ color: index === 0 ? C.line : C.gold, fontSize: 15 }}>▲</Text></Pressable>
          <Pressable onPress={() => reorder(section, index, 1)} hitSlop={8} disabled={index === section.length - 1}><Text style={{ color: index === section.length - 1 ? C.line : C.gold, fontSize: 15 }}>▼</Text></Pressable>
        </View>
      )}
    </View>
  );

  return (
    <>
    <ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
      <View style={{ borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 16, borderRadius: 2, marginBottom: 18 }}>
        <Text style={{ color: C.ivory, fontSize: 14, fontFamily: F.headMid, marginBottom: 10 }}>Tune your program</Text>
        <Chips label="GOAL" options={GOALS} value={goal} onPick={setGoal} />
        <Chips label="EQUIPMENT" options={EQUIP} value={equip} onPick={setEquip} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: F.mono }}>DAYS / WEEK</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Pressable onPress={() => setDays((d) => Math.max(2, d - 1))}><Text style={{ color: C.gold, fontSize: 22 }}>−</Text></Pressable>
            <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head, width: 28, textAlign: "center" }}>{days}</Text>
            <Pressable onPress={() => setDays((d) => Math.min(6, d + 1))}><Text style={{ color: C.gold, fontSize: 22 }}>+</Text></Pressable>
          </View>
        </View>
        <Pressable onPress={generate} disabled={busy} style={{ backgroundColor: C.gold, paddingVertical: 13, alignItems: "center", borderRadius: 2, marginTop: 14, opacity: busy ? 0.6 : 1 }}>
          <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>{busy ? "FORGING…" : routines.length ? "REGENERATE PROGRAM" : "GENERATE MY PROGRAM"}</Text>
        </Pressable>
      </View>

      {routines.length === 0 && (
        <Text style={{ color: C.muted, fontSize: 14, fontFamily: F.body }}>No program yet. Set your goal above and forge one, or build a custom routine from the Library.</Text>
      )}
      {generated.length > 0 && (
        <>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginBottom: 4 }}>YOUR PROGRAM · {generated.length} {generated.length === 1 ? "DAY" : "DAYS"}</Text>
          <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.body, marginBottom: 10 }}>Generated for you. Regenerate above, or hold a card to rename/duplicate/delete.</Text>
          {generated.map((r, i) => routineCard(r, generated, i))}
        </>
      )}
      {custom.length > 0 && (
        <>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginTop: generated.length ? 24 : 0, marginBottom: 4 }}>MY ROUTINES · {custom.length}</Text>
          <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.body, marginBottom: 10 }}>Built by you (gold border). Tap to open. Hold to rename, duplicate, or delete. Arrows reorder.</Text>
          {custom.map((r, i) => routineCard(r, custom, i))}
        </>
      )}
    </ScrollView>
    <Modal visible={!!renaming} transparent animationType="fade" onRequestClose={() => setRenaming(null)}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.82)", justifyContent: "center", padding: 30 }}>
        <View style={{ backgroundColor: C.surface2, borderWidth: 1, borderColor: C.gold, padding: 20, borderRadius: 3 }}>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginBottom: 10 }}>RENAME ROUTINE</Text>
          <TextInput value={renameText} onChangeText={setRenameText} autoFocus style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 2, fontFamily: F.body, fontSize: 16 }} />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 18, marginTop: 16 }}>
            <Pressable onPress={() => setRenaming(null)}><Text style={{ color: C.muted, fontFamily: F.bodyMid }}>Cancel</Text></Pressable>
            <Pressable onPress={saveRename}><Text style={{ color: C.gold, fontFamily: F.bodyMid }}>Save</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

function LibraryTab({ onScroll, router }: { onScroll: any; router: any }) {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState<string | null>(null);
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  async function run() {
    setLoading(true);
    const group = MUSCLE_GROUPS.find((m) => m.label === muscle);
    setItems(await listExercises({ q, muscles: group?.muscles }));
    setLoading(false);
  }
  useEffect(() => { run(); /* eslint-disable-next-line */ }, [muscle]);

  return (
    <FlatList
      data={loading ? [] : items}
      keyExtractor={(e) => e.id}
      onScroll={onScroll}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 22, paddingBottom: 40 }}
      initialNumToRender={12}
      windowSize={7}
      removeClippedSubviews
      ListHeaderComponent={
        <View>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <TextInput value={q} onChangeText={setQ} onSubmitEditing={run} placeholder="Search 870+ exercises…" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 2, fontFamily: F.body }} />
            <Pressable onPress={run} style={{ backgroundColor: C.gold, paddingHorizontal: 16, justifyContent: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontFamily: F.head }}>GO</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 14 }} contentContainerStyle={{ gap: 8 }}>
            <Chip label="All" active={!muscle} onPress={() => setMuscle(null)} />
            {MUSCLE_GROUPS.map((m) => <Chip key={m.label} label={m.label} active={muscle === m.label} onPress={() => setMuscle(m.label)} />)}
          </ScrollView>
          {loading ? <ActivityIndicator color={C.gold} style={{ marginTop: 20 }} /> : null}
        </View>
      }
      renderItem={({ item: e }) => (
        <Pressable onPress={() => router.push(`/exercise/${e.id}`)} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", paddingVertical: 10 }}>
          <View style={{ width: 54, height: 54, borderRadius: 2, backgroundColor: C.surface, overflow: "hidden" }}>
            {e.image_url ? <Image source={{ uri: e.image_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.ivory, fontSize: 14, fontFamily: F.bodyMid }} numberOfLines={1}>{e.name}</Text>
            <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, marginTop: 2 }}>{(e.equipment || "—").toUpperCase()} · {(e.primary_muscles[0] || "").toUpperCase()}</Text>
          </View>
          <Text style={{ color: C.gold, fontSize: 18 }}>›</Text>
        </Pressable>
      )}
    />
  );
}

function Chips({ label, options, value, onPick }: { label: string; options: { v: string; l: string }[]; value: string; onPick: (v: string) => void }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
        {options.map((o) => <Chip key={o.v} label={o.l} active={value === o.v} onPress={() => onPick(o.v)} />)}
      </View>
    </View>
  );
}
function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={{ paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: active ? C.gold : C.line, backgroundColor: active ? C.gold : "transparent", borderRadius: 2 }}><Text style={{ color: active ? C.black : C.muted, fontSize: 11, fontFamily: F.bodyMid }}>{label}</Text></Pressable>;
}
function QuickLink({ icon, label, onPress, accent }: { icon: string; label: string; onPress: () => void; accent?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: accent ? C.gold : C.line, backgroundColor: accent ? "rgba(201,169,97,0.10)" : "transparent", borderRadius: 2 }}>
      <Text style={{ fontSize: 17 }}>{icon}</Text>
      <Text style={{ color: accent ? C.gold : C.ivory, fontSize: 10, letterSpacing: 1, fontFamily: F.mono, marginTop: 3 }}>{label}</Text>
    </Pressable>
  );
}
