import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { loadHonors, type HonorState } from "@/lib/achievements";
import { C, F } from "@/lib/theme";

export default function Honors() {
  const router = useRouter();
  const { session } = useAuth();
  const [honors, setHonors] = useState<HonorState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    loadHonors(session.user.id).then((h) => { setHonors(h); setLoading(false); });
  }, [session]);

  const earned = honors.filter((h) => h.unlocked).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Honors</Text>
      </View>
      {loading ? <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginBottom: 14 }}>{earned} OF {honors.length} ATTAINED</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {honors.map((h) => (
              <View key={h.id} style={{ width: "47.5%", borderWidth: 1, borderColor: h.unlocked ? C.gold : C.line, backgroundColor: h.unlocked ? "rgba(201,169,97,0.08)" : C.surface2, borderRadius: 14, padding: 14, opacity: h.unlocked ? 1 : 0.55 }}>
                <Text style={{ fontSize: 22, marginBottom: 6 }}>{h.unlocked ? "🛡" : "🔒"}</Text>
                <Text style={{ color: h.unlocked ? C.gold : C.text, fontSize: 14, fontFamily: F.headMid }}>{h.name}</Text>
                <Text style={{ color: C.muted, fontSize: 11.5, lineHeight: 16, fontFamily: F.body, marginTop: 3 }}>{h.desc}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
