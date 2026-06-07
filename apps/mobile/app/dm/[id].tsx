import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { loadDm, sendDm, subscribeDm, type DmMsg } from "@/lib/social";
import { violatesGuidelines, reportContent, sendErrorMessage } from "@/lib/moderation";
import { getPublicKey, encryptDM, decryptDM } from "@/lib/crypto";
import { C, F } from "@/lib/theme";

export default function DM() {
  const router = useRouter();
  const { id, name, uid } = useLocalSearchParams<{ id: string; name?: string; uid?: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [messages, setMessages] = useState<DmMsg[]>([]);
  const [text, setText] = useState<Record<string, string>>({}); // id -> decrypted plaintext
  const [input, setInput] = useState("");
  const [otherPub, setOtherPub] = useState<string | null>(null);
  const scroller = useRef<ScrollView>(null);

  useEffect(() => { if (uid) getPublicKey(uid).then(setOtherPub); }, [uid]);

  useEffect(() => {
    if (!id || otherPub === null) return; // wait until we have the partner's key
    loadDm(id).then(async (m) => {
      setMessages(m);
      const map: Record<string, string> = {};
      for (const msg of m) map[msg.id] = await decryptDM(otherPub, msg.body);
      setText(map);
      setTimeout(() => scroller.current?.scrollToEnd({ animated: false }), 60);
    });
    const unsub = subscribeDm(id, async (msg) => {
      const plain = await decryptDM(otherPub, msg.body);
      setText((t) => ({ ...t, [msg.id]: plain }));
      setMessages((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, msg]));
      setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    });
    return () => unsub();
  }, [id, otherPub]);

  async function send() {
    const body = input.trim();
    if (!body || !id || !userId) return;
    if (violatesGuidelines(body)) { Alert.alert("Keep it honoring", "That message breaks the community guidelines."); return; }
    setInput("");
    const tmpId = `tmp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tmpId, body: "", author_id: userId, created_at: new Date().toISOString() }]);
    setText((t) => ({ ...t, [tmpId]: body }));
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    const cipher = otherPub ? await encryptDM(otherPub, body) : null;
    const { error } = await sendDm(id, userId, cipher ?? body); // ciphertext when keys present
    const m = sendErrorMessage(error);
    if (m) { setMessages((prev) => prev.filter((x) => x.id !== tmpId)); Alert.alert("Not sent", m); }
  }

  function report(m: DmMsg) {
    if (!m.author_id || m.author_id === userId || !userId) return;
    Alert.alert("Report this message?", undefined, [
      // include the decrypted text so moderators can act (you reveal it, not the server)
      { text: "Report", style: "destructive", onPress: async () => { await reportContent(userId, { messageId: m.id, targetUser: m.author_id ?? undefined, reason: "dm", detail: text[m.id] }); Alert.alert("Reported", "Thank you. Our team will review it."); } },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
        <View><Text style={{ color: C.ivory, fontSize: 16, fontWeight: "800", fontFamily: F.head }}>{name || "Direct Message"}</Text><Text style={{ color: C.muted, fontSize: 9, letterSpacing: 2, fontFamily: F.mono }}>🔒 END-TO-END ENCRYPTED</Text></View>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={10} style={{ flex: 1 }}>
        <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {messages.length === 0 && <Text style={{ color: C.muted, fontSize: 13, textAlign: "center", marginTop: 30, fontFamily: F.body }}>Say the first word. Only the two of you can read this.</Text>}
          {messages.map((m) => {
            const mine = m.author_id === userId;
            return (
              <Pressable key={m.id} onLongPress={() => report(m)} delayLongPress={350} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%", marginBottom: 10 }}>
                <View style={{ backgroundColor: mine ? "rgba(201,169,97,0.12)" : C.surface2, borderWidth: 1, borderColor: C.line, padding: 11, borderRadius: 2 }}>
                  <Text style={{ color: C.ivory, fontSize: 14, lineHeight: 20, fontFamily: F.body }}>{text[m.id] ?? "…"}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: C.line }}>
          <TextInput value={input} onChangeText={setInput} placeholder="Message…" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 2, fontFamily: F.body }} onSubmitEditing={send} returnKeyType="send" />
          <Pressable onPress={send} style={{ backgroundColor: C.gold, paddingHorizontal: 18, justifyContent: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head }}>SEND</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
