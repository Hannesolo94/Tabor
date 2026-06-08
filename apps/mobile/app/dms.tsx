import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { listDmThreads, type DmThread } from "@/lib/social";
import { C, F } from "@/lib/theme";

export default function Dms() {
  const router = useRouter();
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(useCallback(() => { listDmThreads().then((t) => { setThreads(t); setLoading(false); }); }, []));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.ivory, fontSize: 18, fontWeight: "800", fontFamily: F.head }}>Direct Messages</Text>
          <Text style={{ color: C.muted, fontSize: 10 }}>End-to-end encrypted. Only you and the brother can read them.</Text>
        </View>
        <Pressable onPress={() => router.push("/friends")} style={{ backgroundColor: C.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, fontSize: 11 }}>+ NEW</Text></Pressable>
      </View>
      {loading ? <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {threads.length === 0 && <Text style={{ color: C.muted, fontSize: 14, fontFamily: F.body, marginTop: 10 }}>No conversations yet. Add a brother in Friends, then tap Message to start one.</Text>}
          {threads.map((t) => (
            <Pressable key={t.thread_id} onPress={() => router.push(`/dm/${t.thread_id}?name=${encodeURIComponent(t.name || "Brother")}&uid=${t.other_id}`)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line, padding: 14, borderRadius: 12, marginBottom: 8 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", marginRight: 12 }}><Text style={{ color: C.gold, fontFamily: F.head, fontSize: 16 }}>{(t.name || "B")[0].toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.bodyMid }}>{t.name || "Brother"}</Text>
                <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono }}>@{t.handle} · encrypted</Text>
              </View>
              <Text style={{ color: C.gold, fontSize: 18 }}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
