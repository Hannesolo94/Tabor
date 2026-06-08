import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, F } from "@/lib/theme";

export function Pillar({ tag, title, intro, points }: { tag: string; title: string; intro: string; points: string[] }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono }}>[ {tag} ]</Text>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", fontFamily: F.head, marginTop: 6 }}>{title}</Text>
        <Text style={{ color: C.muted, fontSize: 14, marginTop: 10, lineHeight: 22 }}>{intro}</Text>
        <View style={{ marginTop: 22 }}>
          {points.map((p) => (
            <View key={p} style={{ borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 16, marginBottom: 10, borderRadius: 12 }}>
              <Text style={{ color: C.text, fontSize: 14 }}>{p}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginTop: 18, textAlign: "center" }}>BEING FORGED · ARRIVES IN THE NEXT BUILD</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
