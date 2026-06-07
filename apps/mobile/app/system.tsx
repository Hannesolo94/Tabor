import { useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { askSystem, type SysMsg } from "@/lib/system";
import { Seal } from "@/components/Seal";
import { C, F } from "@/lib/theme";

export default function System() {
  const router = useRouter();
  const [messages, setMessages] = useState<SysMsg[]>([{ role: "system", content: "[ THE SYSTEM AWAKENS ]\nSpeak, brother. Bring me your battle: body, Word, or brotherhood. I will counsel you." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<ScrollView>(null);

  async function send() {
    const body = input.trim();
    if (!body || busy) return;
    const next: SysMsg[] = [...messages, { role: "user", content: body }];
    setMessages(next); setInput(""); setBusy(true);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    const { reply } = await askSystem(next);
    setMessages((m) => [...m, { role: "system", content: reply }]);
    setBusy(false);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 80);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
        <Seal size={26} />
        <View>
          <Text style={{ color: C.ivory, fontSize: 16, fontWeight: "800", fontFamily: F.head }}>The System</Text>
          <Text style={{ color: C.muted, fontSize: 9, letterSpacing: 2 }}>YOUR MENTOR</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={10} style={{ flex: 1 }}>
        <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {messages.map((m, i) => (
            <View key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", marginBottom: 14 }}>
              <Text style={{ color: m.role === "user" ? C.gold : C.muted, fontSize: 9, letterSpacing: 2, marginBottom: 4, textAlign: m.role === "user" ? "right" : "left" }}>{m.role === "user" ? "YOU" : "THE SYSTEM"}</Text>
              <View style={{ backgroundColor: m.role === "user" ? "rgba(201,169,97,0.12)" : C.surface2, borderWidth: 1, borderColor: m.role === "system" ? "rgba(201,169,97,0.3)" : C.line, padding: 13, borderRadius: 2 }}>
                <Text style={{ color: C.ivory, fontSize: 14, lineHeight: 21 }}>{m.content}</Text>
              </View>
            </View>
          ))}
          {busy && <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 3 }}>THE SYSTEM CONSIDERS…</Text>}
        </ScrollView>
        <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: C.line }}>
          <TextInput value={input} onChangeText={setInput} placeholder="Speak to the System…" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 2 }} onSubmitEditing={send} returnKeyType="send" />
          <Pressable onPress={send} style={{ backgroundColor: C.gold, paddingHorizontal: 18, justifyContent: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head }}>SEND</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
