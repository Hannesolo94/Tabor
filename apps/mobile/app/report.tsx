import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/lib/auth";
import { submitReport } from "@/lib/feedback";
import { C, F } from "@/lib/theme";

export default function Report() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [kind, setKind] = useState<"bug" | "feature">("bug");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [shots, setShots] = useState<{ uri: string; base64: string; ext: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], base64: true, quality: 0.6, allowsMultipleSelection: true, selectionLimit: 4 });
    if (res.canceled) return;
    const next = res.assets.map((a) => ({ uri: a.uri, base64: a.base64 ?? "", ext: (a.uri.split(".").pop() || "jpg").toLowerCase() })).filter((s) => s.base64);
    setShots((prev) => [...prev, ...next].slice(0, 4));
  }

  async function send() {
    if (!userId || !title.trim()) { Alert.alert("Add a title", "Give it a short title so we know what broke."); return; }
    setBusy(true);
    const { error } = await submitReport(userId, { kind, title, body, shots: shots.map((s) => ({ base64: s.base64, ext: s.ext })) });
    setBusy(false);
    if (error) { Alert.alert("Could not send", error); return; }
    setDone(true);
  }

  if (done) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black, padding: 26, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 4, fontFamily: F.mono }}>[ REPORT RECEIVED ]</Text>
      <Text style={{ color: C.text, fontSize: 15, fontFamily: F.body, textAlign: "center", marginVertical: 14, lineHeight: 22 }}>Thank you, brother. Your report is logged and our team will look into it. You are making TABOR stronger.</Text>
      <Pressable onPress={() => router.back()} style={{ backgroundColor: C.gold, paddingVertical: 13, paddingHorizontal: 30, borderRadius: 2 }}><Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>DONE</Text></Pressable>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Report a problem</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {(["bug", "feature"] as const).map((k) => (
            <Pressable key={k} onPress={() => setKind(k)} style={{ flex: 1, borderWidth: 1, borderColor: kind === k ? C.gold : C.line, backgroundColor: kind === k ? "rgba(201,169,97,0.1)" : "transparent", paddingVertical: 11, alignItems: "center", borderRadius: 2 }}>
              <Text style={{ color: kind === k ? C.gold : C.muted, fontFamily: F.mono, fontSize: 11 }}>{k === "bug" ? "SOMETHING BROKE" : "FEATURE IDEA"}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={lbl}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Scan button does nothing" placeholderTextColor={C.muted} style={inp} />

        <Text style={lbl}>What happened? (tap the mic on your keyboard to dictate)</Text>
        <TextInput value={body} onChangeText={setBody} placeholder="Describe it. What did you expect, what happened instead?" placeholderTextColor={C.muted} multiline style={[inp, { height: 130, textAlignVertical: "top" }]} />

        <Text style={lbl}>Screenshots (optional)</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {shots.map((s, i) => (
            <Pressable key={i} onPress={() => setShots((p) => p.filter((_, j) => j !== i))}>
              <Image source={{ uri: s.uri }} style={{ width: 70, height: 70, borderRadius: 4, borderWidth: 1, borderColor: C.line }} />
              <Text style={{ color: C.red, fontSize: 9, textAlign: "center", fontFamily: F.mono, marginTop: 2 }}>REMOVE</Text>
            </Pressable>
          ))}
          {shots.length < 4 && (
            <Pressable onPress={pick} style={{ width: 70, height: 70, borderWidth: 1, borderColor: C.gold, borderRadius: 4, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: C.gold, fontSize: 24 }}>+</Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={send} disabled={busy} style={{ backgroundColor: C.gold, paddingVertical: 15, alignItems: "center", borderRadius: 2, marginTop: 24, opacity: busy ? 0.6 : 1 }}>
          {busy ? <ActivityIndicator color={C.black} /> : <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>SEND REPORT</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const lbl = { color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginTop: 16, marginBottom: 6 } as const;
const inp = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 2, fontFamily: F.body, fontSize: 15 } as const;
