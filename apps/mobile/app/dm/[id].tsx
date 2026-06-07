import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { loadDm, sendDm, subscribeDm, type DmMsg } from "@/lib/social";
import { violatesGuidelines, reportContent, sendErrorMessage } from "@/lib/moderation";
import { C } from "@/lib/theme";

export default function DM() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [messages, setMessages] = useState<DmMsg[]>([]);
  const [input, setInput] = useState("");
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id) return;
    loadDm(id).then((m) => { setMessages(m); setTimeout(() => scroller.current?.scrollToEnd({ animated: false }), 60); });
    const unsub = subscribeDm(id, (msg) => {
      setMessages((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, msg]));
      setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    });
    return () => unsub();
  }, [id]);

  async function send() {
    const body = input.trim();
    if (!body || !id || !userId) return;
    if (violatesGuidelines(body)) { Alert.alert("Keep it honoring", "That message breaks the community guidelines."); return; }
    setInput("");
    const tmpId = `tmp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tmpId, body, author_id: userId, created_at: new Date().toISOString() }]);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    const { error } = await sendDm(id, userId, body);
    const m = sendErrorMessage(error);
    if (m) { setMessages((prev) => prev.filter((x) => x.id !== tmpId)); Alert.alert("Not sent", m); }
  }

  function report(m: DmMsg) {
    if (!m.author_id || m.author_id === userId || !userId) return;
    Alert.alert("Report this message?", undefined, [
      { text: "Report", style: "destructive", onPress: async () => { await reportContent(userId, { messageId: m.id, targetUser: m.author_id ?? undefined, reason: "dm" }); Alert.alert("Reported", "Thank you. Our team will review it."); } },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
        <View><Text style={{ color: C.ivory, fontSize: 16, fontWeight: "800" }}>{name || "Direct Message"}</Text><Text style={{ color: C.muted, fontSize: 9, letterSpacing: 2 }}>DIRECT MESSAGE</Text></View>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={10} style={{ flex: 1 }}>
        <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {messages.length === 0 && <Text style={{ color: C.muted, fontSize: 13, textAlign: "center", marginTop: 30 }}>Say the first word.</Text>}
          {messages.map((m) => {
            const mine = m.author_id === userId;
            return (
              <Pressable key={m.id} onLongPress={() => report(m)} delayLongPress={350} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%", marginBottom: 10 }}>
                <View style={{ backgroundColor: mine ? "rgba(201,169,97,0.12)" : C.surface2, borderWidth: 1, borderColor: C.line, padding: 11, borderRadius: 2 }}>
                  <Text style={{ color: C.ivory, fontSize: 14, lineHeight: 20 }}>{m.body}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: C.line }}>
          <TextInput value={input} onChangeText={setInput} placeholder="Message…" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 2 }} onSubmitEditing={send} returnKeyType="send" />
          <Pressable onPress={send} style={{ backgroundColor: C.gold, paddingHorizontal: 18, justifyContent: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontWeight: "800" }}>SEND</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
