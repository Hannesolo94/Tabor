import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getRoutineExercises, deleteRoutine, type RoutineExercise } from "@/lib/fitness";
import { todayKey } from "@/lib/quests";
import { C, F } from "@/lib/theme";

export default function RoutineDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [name, setName] = useState("Routine");
  const [generated, setGenerated] = useState(true);
  const [items, setItems] = useState<RoutineExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("routines").select("name, focus, generated").eq("id", id).maybeSingle().then(({ data }) => { if (data) { setName(data.name); setGenerated(data.generated); } });
    getRoutineExercises(id).then((x) => { setItems(x); setLoading(false); });
  }, [id]);

  async function complete() {
    if (!userId) return;
    await supabase.from("workouts").insert({ user_id: userId, name, mins: Math.max(20, items.length * 8), day: todayKey() });
    Alert.alert("Workout logged", "Well fought. The body is forged.");
    router.back();
  }
  function confirmDelete() {
    Alert.alert("Delete routine?", "", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: async () => { if (id) await deleteRoutine(id); router.back(); } }]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        {!generated && <Pressable onPress={confirmDelete} hitSlop={10}><Text style={{ color: C.red, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>DELETE</Text></Pressable>}
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 0, paddingBottom: 40 }}>
        <Text style={{ color: C.ivory, fontSize: 26, fontFamily: F.head }}>{name}</Text>
        <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, marginTop: 4, marginBottom: 18 }}>{items.length} EXERCISES</Text>

        {loading ? <ActivityIndicator color={C.gold} /> : items.map((it, i) => (
          <Pressable key={it.id} onPress={() => router.push(`/exercise/${it.exercise_id}`)} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 12, borderRadius: 2, marginBottom: 10 }}>
            <View style={{ width: 56, height: 56, borderRadius: 2, backgroundColor: C.surface, overflow: "hidden" }}>
              {it.exercise?.image_url ? <Image source={{ uri: it.exercise.image_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.ivory, fontSize: 14, fontFamily: F.bodyMid }} numberOfLines={1}>{i + 1}. {it.exercise?.name ?? "Exercise"}</Text>
              <Text style={{ color: C.gold, fontSize: 12, fontFamily: F.mono, marginTop: 3 }}>{it.sets} × {it.reps}  ·  {it.rest}s rest</Text>
            </View>
            <Text style={{ color: C.gold, fontSize: 16 }}>›</Text>
          </Pressable>
        ))}

        {items.length > 0 && (
          <Pressable onPress={complete} style={{ backgroundColor: C.gold, paddingVertical: 15, alignItems: "center", borderRadius: 2, marginTop: 14 }}>
            <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>COMPLETE WORKOUT</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
