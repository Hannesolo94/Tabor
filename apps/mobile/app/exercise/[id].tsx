import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, Linking, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getExercise, getRoutines, createRoutine, addExerciseToRoutine, type Exercise, type Routine } from "@/lib/fitness";
import { C, F } from "@/lib/theme";

export default function ExerciseDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [ex, setEx] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [picker, setPicker] = useState(false);

  useEffect(() => {
    if (!id) return;
    getExercise(id).then((e) => { setEx(e); setLoading(false); });
  }, [id]);

  async function openPicker() {
    if (!userId) return;
    const rs = (await getRoutines(userId)).filter((r) => !r.generated);
    setRoutines(rs);
    setPicker(true);
  }
  async function addTo(routineId: string) {
    if (!ex) return;
    await addExerciseToRoutine(routineId, ex.id);
    setPicker(false);
    Alert.alert("Added", "Exercise added to your routine.");
  }
  async function newRoutineWith() {
    if (!userId || !ex) return;
    const rid = await createRoutine(userId, "My Routine");
    if (rid) { await addExerciseToRoutine(rid, ex.id); setPicker(false); Alert.alert("Routine created", "Added to a new custom routine."); }
  }

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;
  if (!ex) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><Text style={{ color: C.muted }}>Not found.</Text></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 0, paddingBottom: 40 }}>
        {ex.image_url ? (
          <View style={{ width: "100%", aspectRatio: 1.3, backgroundColor: C.surface, borderRadius: 3, overflow: "hidden", marginBottom: 16 }}>
            <Image source={{ uri: ex.image_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          </View>
        ) : null}
        <Text style={{ color: C.ivory, fontSize: 24, fontFamily: F.head }}>{ex.name}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {[ex.equipment, ex.level, ex.mechanic, ...ex.primary_muscles].filter(Boolean).map((t, i) => (
            <View key={i} style={{ borderWidth: 1, borderColor: C.line, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 2 }}><Text style={{ color: C.ivory, fontSize: 11, fontFamily: F.mono, textTransform: "uppercase" }}>{t}</Text></View>
          ))}
        </View>

        <Pressable onPress={() => ex.video_url && Linking.openURL(ex.video_url)} style={{ borderWidth: 1, borderColor: C.gold, paddingVertical: 13, alignItems: "center", borderRadius: 2, marginTop: 18 }}>
          <Text style={{ color: C.gold, fontFamily: F.head, letterSpacing: 1, fontSize: 13 }}>▶  WATCH DEMO</Text>
        </Pressable>
        <Pressable onPress={openPicker} style={{ backgroundColor: C.gold, paddingVertical: 13, alignItems: "center", borderRadius: 2, marginTop: 10 }}>
          <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1, fontSize: 13 }}>+  ADD TO ROUTINE</Text>
        </Pressable>

        {picker && (
          <View style={{ borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 14, borderRadius: 2, marginTop: 12 }}>
            <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginBottom: 8 }}>ADD TO…</Text>
            {routines.map((r) => (
              <Pressable key={r.id} onPress={() => addTo(r.id)} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}><Text style={{ color: C.ivory, fontFamily: F.bodyMid }}>{r.name}</Text></Pressable>
            ))}
            <Pressable onPress={newRoutineWith} style={{ paddingVertical: 10 }}><Text style={{ color: C.gold, fontFamily: F.bodyMid }}>+ New custom routine</Text></Pressable>
          </View>
        )}

        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginTop: 26, marginBottom: 10 }}>INSTRUCTIONS</Text>
        {ex.instructions.map((step, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 12 }}>
            <Text style={{ color: C.gold, fontFamily: F.head, fontSize: 14, width: 26 }}>{i + 1}</Text>
            <Text style={{ color: C.text, fontSize: 14.5, lineHeight: 22, fontFamily: F.body, flex: 1 }}>{step}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
