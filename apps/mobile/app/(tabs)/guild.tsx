import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { ensureGuild, loadMessages, sendMessage, loadRoster, subscribeMessages, type Channel, type Msg, type Member } from "@/lib/guild";
import { blockUser } from "@/lib/social";
import { violatesGuidelines, reportContent, sendErrorMessage } from "@/lib/moderation";
import { rankForLevel, levelFromXp } from "@/lib/game";
import { C } from "@/lib/theme";

export default function Guild() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [guildId, setGuildId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [roster, setRoster] = useState<Member[]>([]);
  const [view, setView] = useState<"chat" | "roster">("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scroller = useRef<ScrollView>(null);

  const nameMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of roster) m[r.user_id] = r.name || "Brother";
    return m;
  }, [roster]);

  // join + load channels + roster
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { guildId: gid, channels: ch } = await ensureGuild(userId);
      setGuildId(gid);
      setChannels(ch);
      setActive(ch.find((c) => c.name === "war-room") ?? ch[0] ?? null);
      if (gid) setRoster(await loadRoster(gid));
      setLoading(false);
    })();
  }, [userId]);

  // load + subscribe per channel
  useEffect(() => {
    if (!active) return;
    let unsub = () => {};
    loadMessages(active.id).then((m) => {
      setMessages(m);
      setTimeout(() => scroller.current?.scrollToEnd({ animated: false }), 60);
    });
    unsub = subscribeMessages(active.id, (msg) => {
      setMessages((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev, msg]));
      setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    });
    return () => unsub();
  }, [active]);

  async function send() {
    const body = input.trim();
    if (!body || !active || !guildId || !userId) return;
    if (violatesGuidelines(body)) { Alert.alert("Keep it honoring", "That message breaks the community guidelines."); return; }
    setInput("");
    const optimistic: Msg = { id: `tmp-${Date.now()}`, body, author_id: userId, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    const { error } = await sendMessage(active.id, guildId, userId, body);
    const msg = sendErrorMessage(error);
    if (msg) { setMessages((prev) => prev.filter((m) => m.id !== optimistic.id)); Alert.alert("Not sent", msg); }
  }

  function moderate(m: Msg) {
    if (!m.author_id || m.author_id === userId) return;
    Alert.alert("Message options", undefined, [
      { text: "Report", onPress: async () => { if (userId) await reportContent(userId, { messageId: m.id, targetUser: m.author_id ?? undefined, reason: "message" }); Alert.alert("Reported", "Thank you. Our team will review it."); } },
      { text: "Block this brother", style: "destructive", onPress: async () => { if (m.author_id) await blockUser(m.author_id); Alert.alert("Blocked", "You will no longer see them."); } },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  if (loading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4 }}>[ BROTHERHOOD ]</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: C.ivory, fontSize: 24, fontWeight: "800" }}>Sons of Tabor</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {(["chat", "roster"] as const).map((v) => (
              <Pressable key={v} onPress={() => setView(v)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: view === v ? C.gold : C.line, backgroundColor: view === v ? C.gold : "transparent", borderRadius: 2 }}>
                <Text style={{ color: view === v ? C.black : C.muted, fontSize: 9, letterSpacing: 1, fontWeight: "700" }}>{v === "chat" ? "CHAT" : "RANKS"}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {view === "chat" ? (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90} style={{ flex: 1 }}>
          {/* channel pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
            {channels.map((c) => (
              <Pressable key={c.id} onPress={() => setActive(c)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: active?.id === c.id ? C.gold : C.line, borderRadius: 2 }}>
                <Text style={{ color: active?.id === c.id ? C.gold : C.muted, fontSize: 11 }}>#{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }}>
            {messages.length === 0 && <Text style={{ color: C.muted, fontSize: 13, textAlign: "center", marginTop: 30 }}>No words yet in #{active?.name}. Break the silence.</Text>}
            {messages.map((m) => {
              const mine = m.author_id === userId;
              return (
                <Pressable key={m.id} onLongPress={() => moderate(m)} delayLongPress={350} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%", marginBottom: 10 }}>
                  <Text style={{ color: mine ? C.gold : C.muted, fontSize: 9, letterSpacing: 1, marginBottom: 3, textAlign: mine ? "right" : "left" }}>{mine ? "YOU" : (m.author_id ? nameMap[m.author_id] ?? "Brother" : "System").toUpperCase()}</Text>
                  <View style={{ backgroundColor: mine ? "rgba(201,169,97,0.12)" : C.surface2, borderWidth: 1, borderColor: C.line, padding: 11, borderRadius: 2 }}>
                    <Text style={{ color: C.ivory, fontSize: 14, lineHeight: 20 }}>{m.body}</Text>
                  </View>
                  {!mine && <Text style={{ color: C.muted, fontSize: 8, marginTop: 2 }}>hold to report</Text>}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: C.line }}>
            <TextInput value={input} onChangeText={setInput} placeholder={`Message #${active?.name ?? ""}`} placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 2 }} onSubmitEditing={send} returnKeyType="send" />
            <Pressable onPress={send} style={{ backgroundColor: C.gold, paddingHorizontal: 18, justifyContent: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontWeight: "800" }}>SEND</Text></Pressable>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <Text style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>THE LEADERBOARD · {roster.length} {roster.length === 1 ? "BROTHER" : "BROTHERS"}</Text>
          {roster.map((m, i) => (
            <View key={m.user_id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
              <Text style={{ color: i < 3 ? C.gold : C.muted, fontSize: 16, fontWeight: "800", width: 34 }}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: m.user_id === userId ? C.gold : C.ivory, fontSize: 15, fontWeight: "600" }}>{m.name || "Brother"}{m.user_id === userId ? " (you)" : ""}</Text>
                <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 1, marginTop: 2 }}>{(m.cls || "Pilgrim").toUpperCase()} · {rankForLevel(levelFromXp(Number(m.xp) || 0)).toUpperCase()} · {Number(m.streak) || 0}d</Text>
              </View>
              <Text style={{ color: C.gold, fontSize: 14, fontWeight: "700" }}>{Number(m.xp) || 0} XP</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
