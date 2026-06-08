import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/lib/auth";
import { loadDm, sendDm, subscribeDm, type DmMsg } from "@/lib/social";
import { violatesGuidelines, reportContent, sendErrorMessage } from "@/lib/moderation";
import { getPublicKey, encryptDM, decryptDM } from "@/lib/crypto";
import { uploadChatMedia, mediaBody, parseMedia, type MediaRef } from "@/lib/media";
import { MediaBubble } from "@/components/MediaBubble";
import { GifPicker } from "@/components/GifPicker";
import { useActionSheet } from "@/components/ActionSheet";
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
  const [gifOpen, setGifOpen] = useState(false);
  const sheet = useActionSheet();
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
      setMessages((prev) => {
        if (prev.some((p) => p.id === msg.id)) return prev; // already have the real row
        // replace my own optimistic (tmp-) bubble instead of showing a duplicate
        let i = -1;
        for (let k = prev.length - 1; k >= 0; k--) { if (prev[k].id.startsWith("tmp-") && prev[k].author_id === msg.author_id) { i = k; break; } }
        if (i >= 0) {
          const oldId = prev[i].id;
          // keep our own plaintext: we can't decrypt our own ciphertext, so the optimistic copy is the source of truth
          setText((t) => { const nt = { ...t }; nt[msg.id] = t[oldId] ?? plain; delete nt[oldId]; return nt; });
          const next = [...prev]; next[i] = msg; return next;
        }
        setText((t) => ({ ...t, [msg.id]: plain }));
        return [...prev, msg];
      });
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

  async function sendMediaRef(ref: MediaRef) {
    if (!id || !userId) return;
    const content = mediaBody(ref);
    const tmpId = `tmp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tmpId, body: "", author_id: userId, created_at: new Date().toISOString() }]);
    setText((t) => ({ ...t, [tmpId]: content })); // keep our own copy: we can't decrypt our own ciphertext
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    const cipher = otherPub ? await encryptDM(otherPub, content) : null;
    const { error } = await sendDm(id, userId, cipher ?? content); // media url stays inside the E2EE body
    if (error) setMessages((prev) => prev.filter((x) => x.id !== tmpId));
  }
  async function pickMedia() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access to share media."); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], quality: 0.6, videoMaxDuration: 60 });
    if (res.canceled || !res.assets?.[0] || !userId) return;
    const a = res.assets[0];
    const isVideo = a.type === "video";
    const ext = isVideo ? "mp4" : a.uri.toLowerCase().endsWith(".png") ? "png" : "jpg";
    const url = await uploadChatMedia(userId, a.uri, ext, a.mimeType || (isVideo ? "video/mp4" : "image/jpeg"));
    if (!url) { Alert.alert("Upload failed", "Try again."); return; }
    await sendMediaRef({ t: isVideo ? "video" : "image", url });
  }
  function attach() {
    sheet({ title: "Attach", actions: [
      { label: "📷  Photo / Video", onPress: pickMedia },
      { label: "🎞  GIF", onPress: () => setGifOpen(true) },
      { label: "Cancel", style: "cancel" },
    ] });
  }

  function report(m: DmMsg) {
    if (!m.author_id || m.author_id === userId || !userId) return;
    // include the decrypted text so moderators can act (you reveal it, not the server)
    sheet({ title: "Report this message?", actions: [
      { label: "Report", style: "destructive", onPress: async () => { await reportContent(userId, { messageId: m.id, targetUser: m.author_id ?? undefined, reason: "dm", detail: text[m.id] }); Alert.alert("Reported", "Thank you. Our team will review it."); } },
      { label: "Cancel", style: "cancel" },
    ] });
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
                {parseMedia(text[m.id]) ? <MediaBubble media={parseMedia(text[m.id])!} /> : (
                  <View style={{ backgroundColor: mine ? "rgba(201,169,97,0.12)" : C.surface2, borderWidth: 1, borderColor: C.line, padding: 11, borderRadius: 12 }}>
                    <Text style={{ color: C.ivory, fontSize: 14, lineHeight: 20, fontFamily: F.body }}>{text[m.id] ?? "…"}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={{ flexDirection: "row", gap: 6, padding: 12, borderTopWidth: 1, borderTopColor: C.line, alignItems: "center" }}>
          <Pressable onPress={attach} hitSlop={6} style={{ justifyContent: "center", paddingHorizontal: 4 }}><Text style={{ color: C.gold, fontSize: 24 }}>＋</Text></Pressable>
          <TextInput value={input} onChangeText={setInput} placeholder="Message…" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, fontFamily: F.body }} onSubmitEditing={send} returnKeyType="send" />
          <Pressable onPress={send} style={{ backgroundColor: C.gold, paddingHorizontal: 16, justifyContent: "center", borderRadius: 12 }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head }}>SEND</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
      <GifPicker visible={gifOpen} onClose={() => setGifOpen(false)} onPick={(url) => sendMediaRef({ t: "gif", url })} />
    </SafeAreaView>
  );
}
