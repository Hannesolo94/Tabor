import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { uploadChatMedia, mediaBody, parseMedia } from "@/lib/media";
import { MediaBubble } from "@/components/MediaBubble";
import { GifPicker } from "@/components/GifPicker";
import { useActionSheet, type SheetAction } from "@/components/ActionSheet";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { ensureGuild, loadMessages, sendMessage, loadRoster, subscribeMessages, loadChannels, loadReactions, toggleReaction, getGlobalChannel, getRecentEmojis, pushRecentEmoji, type Channel, type Msg, type Member, type ReactionInfo } from "@/lib/guild";
import { EmojiPicker } from "@/components/EmojiPicker";
import { blockUser, myGuilds, openDm, getPublicProfile, sendFriendRequest, type GuildRow, type PublicProfile } from "@/lib/social";
import { violatesGuidelines, reportContent, sendErrorMessage } from "@/lib/moderation";
import { rankForLevel, levelFromXp } from "@/lib/game";
import { C, F } from "@/lib/theme";

type Mode = "community" | "board" | "guild";
type Glob = { id: string; guild_id: string } | null;

export default function Guild() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const router = useRouter();
  const sheet = useActionSheet();

  const [mode, setMode] = useState<Mode>("community");
  const [isStaff, setIsStaff] = useState(false);
  const [profileUser, setProfileUser] = useState<PublicProfile | null>(null);
  const [gifOpen, setGifOpen] = useState(false);
  const [emojiFor, setEmojiFor] = useState<Msg | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [communityCh, setCommunityCh] = useState<Glob>(null);
  const [announceCh, setAnnounceCh] = useState<Glob>(null);

  const [guildId, setGuildId] = useState<string | null>(null);
  const [guilds, setGuilds] = useState<GuildRow[]>([]);
  const [guildName, setGuildName] = useState("Sons of Tabor");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reactions, setReactions] = useState<Record<string, ReactionInfo>>({});
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

  // the channel/guild we're actually viewing depends on the mode
  const effChannel = mode === "community" ? communityCh?.id ?? null : mode === "board" ? announceCh?.id ?? null : active?.id ?? null;
  const effGuild = mode === "community" ? communityCh?.guild_id ?? null : mode === "board" ? announceCh?.guild_id ?? null : guildId;
  const canPost = mode !== "board" || isStaff;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle();
      setIsStaff(prof?.role === "admin" || prof?.role === "moderator");
      getRecentEmojis(userId).then(setRecents).catch(() => {});
      setCommunityCh(await getGlobalChannel("community"));
      setAnnounceCh(await getGlobalChannel("announcements"));
      const { guildId: gid, channels: ch } = await ensureGuild(userId);
      setGuildId(gid);
      setChannels(ch);
      setActive(ch.find((c) => c.name === "war-room") ?? ch[0] ?? null);
      if (gid) setRoster(await loadRoster(gid));
      const mine = await myGuilds(userId);
      setGuilds(mine.filter((g) => g.name !== "TABOR Community"));
      const cur = mine.find((g) => g.id === gid);
      if (cur) setGuildName(cur.name);
      setLoading(false);
    })();
  }, [userId]);

  // load + subscribe to the effective channel
  useEffect(() => {
    if (!effChannel) { setMessages([]); return; }
    let unsub = () => {};
    loadMessages(effChannel).then(async (m) => {
      setMessages(m);
      if (userId) setReactions(await loadReactions(m.map((x) => x.id), userId));
      setTimeout(() => scroller.current?.scrollToEnd({ animated: false }), 60);
    });
    unsub = subscribeMessages(effChannel, (msg) => {
      setMessages((prev) => {
        if (prev.some((p) => p.id === msg.id)) return prev;
        const i = prev.findIndex((p) => p.id.startsWith("tmp-") && p.author_id === msg.author_id && p.body === msg.body);
        if (i >= 0) { const next = [...prev]; next[i] = msg; return next; }
        return [...prev, msg];
      });
      setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    });
    return () => unsub();
  }, [effChannel, userId]);

  async function send() {
    const body = input.trim();
    if (!body || !effChannel || !effGuild || !userId || !canPost) return;
    if (violatesGuidelines(body)) { sheet({ title: "Keep it honoring", message: "That message breaks the community guidelines.", actions: [{ label: "Got it", style: "cancel" }] }); return; }
    setInput("");
    const optimistic: Msg = { id: `tmp-${Date.now()}`, body, author_id: userId, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    const { error, hidden } = await sendMessage(effChannel, effGuild, userId, body);
    const msg = sendErrorMessage(error);
    if (msg) { setMessages((prev) => prev.filter((m) => m.id !== optimistic.id)); sheet({ title: "Not sent", message: msg, actions: [{ label: "Got it", style: "cancel" }] }); }
    else if (hidden) { setMessages((prev) => prev.filter((m) => m.id !== optimistic.id)); sheet({ title: "Removed", message: "That message broke the guidelines and was removed. You have been silenced pending review.", actions: [{ label: "Got it", style: "cancel" }] }); }
  }

  async function pickMedia() {
    if (!effChannel || !effGuild || !userId || !canPost) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { sheet({ title: "Permission needed", message: "Allow photo access to share media.", actions: [{ label: "Got it", style: "cancel" }] }); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], quality: 0.6, videoMaxDuration: 60 });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    const isVideo = a.type === "video";
    const ext = isVideo ? "mp4" : a.uri.toLowerCase().endsWith(".png") ? "png" : "jpg";
    const url = await uploadChatMedia(userId, a.uri, ext, a.mimeType || (isVideo ? "video/mp4" : "image/jpeg"));
    if (!url) { sheet({ title: "Upload failed", message: "Try again.", actions: [{ label: "Got it", style: "cancel" }] }); return; }
    await sendMessage(effChannel, effGuild, userId, mediaBody({ t: isVideo ? "video" : "image", url }));
  }
  async function sendGif(url: string) {
    if (effChannel && effGuild && userId && canPost) await sendMessage(effChannel, effGuild, userId, mediaBody({ t: "gif", url }));
  }
  function attach() {
    sheet({ title: "Attach", actions: [
      { label: "📷  Photo / Video", onPress: pickMedia },
      { label: "🎞  GIF", onPress: () => setGifOpen(true) },
      { label: "Cancel", style: "cancel" },
    ] });
  }

  async function selectGuild(g: GuildRow) {
    if (g.id === guildId) return;
    setGuildId(g.id); setGuildName(g.name); setMessages([]);
    const ch = await loadChannels(g.id);
    setChannels(ch);
    setActive(ch.find((c) => c.name === "war-room") ?? ch[0] ?? null);
    setRoster(await loadRoster(g.id));
  }

  function react(m: Msg, emoji: string) {
    if (!userId) return;
    const cur = reactions[m.id] ?? { counts: {}, mine: [] };
    const mine = cur.mine.includes(emoji);
    const counts = { ...cur.counts };
    counts[emoji] = Math.max(0, (counts[emoji] ?? 0) + (mine ? -1 : 1));
    if (counts[emoji] === 0) delete counts[emoji];
    const mineNext = mine ? cur.mine.filter((e) => e !== emoji) : [...cur.mine, emoji];
    setReactions((r) => ({ ...r, [m.id]: { counts, mine: mineNext } }));
    toggleReaction(m.id, userId, emoji, !mine).catch(() => {});
  }
  function doReact(m: Msg, emoji: string) {
    react(m, emoji);
    if (userId) pushRecentEmoji(userId, emoji, recents).then(setRecents).catch(() => {});
  }

  async function openProfile(uid: string) {
    const p = await getPublicProfile(uid);
    if (p) setProfileUser(p);
  }

  function onMessagePress(m: Msg) {
    const actions: SheetAction[] = [];
    if (m.author_id && m.author_id !== userId) {
      actions.push({ label: "View profile", onPress: () => openProfile(m.author_id!) });
      actions.push({ label: "Report message", onPress: async () => { if (userId) await reportContent(userId, { messageId: m.id, targetUser: m.author_id ?? undefined, reason: "message" }); sheet({ title: "Reported", message: "Thank you. Our team will review it.", actions: [{ label: "Got it", style: "cancel" }] }); } });
      actions.push({ label: "Block this brother", style: "destructive", onPress: async () => { if (m.author_id) await blockUser(m.author_id); sheet({ title: "Blocked", message: "You will no longer see them.", actions: [{ label: "Got it", style: "cancel" }] }); } });
    }
    actions.push({ label: "Cancel", style: "cancel" });
    const base = recents.length ? recents.slice(0, 5) : ["🔥", "🙏", "💪"];
    const reactions = base.map((e) => ({ emoji: e, onPress: () => doReact(m, e) }));
    reactions.push({ emoji: "➕", onPress: () => setEmojiFor(m) });
    sheet({ title: "Message", reactions, actions });
  }

  if (loading) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;
  }

  const MODES: { k: Mode; label: string }[] = [{ k: "community", label: "COMMUNITY" }, { k: "board", label: "BOARD" }, { k: "guild", label: "GUILDS" }];
  const showRoster = mode === "guild" && view === "roster";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono }}>[ BROTHERHOOD ]</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Pressable onPress={() => router.push("/dms")} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderWidth: 1, borderColor: C.gold, backgroundColor: "rgba(201,169,97,0.10)", borderRadius: 12 }}><Text style={{ fontSize: 15 }}>✉</Text><Text style={{ color: C.gold, fontSize: 11, fontFamily: F.headMid, letterSpacing: 1 }}>MESSAGES</Text></Pressable>
          <Pressable onPress={() => router.push("/friends")} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderWidth: 1, borderColor: C.line, borderRadius: 12 }}><Text style={{ fontSize: 15 }}>👥</Text><Text style={{ color: C.ivory, fontSize: 11, fontFamily: F.headMid, letterSpacing: 1 }}>FRIENDS</Text></Pressable>
        </View>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
          {MODES.map((m) => (
            <Pressable key={m.k} onPress={() => setMode(m.k)} style={{ flex: 1, alignItems: "center", paddingVertical: 9, borderWidth: 1, borderColor: mode === m.k ? C.gold : C.line, backgroundColor: mode === m.k ? C.gold : "transparent", borderRadius: 12 }}>
              <Text style={{ color: mode === m.k ? C.black : C.ivory, fontSize: 11, letterSpacing: 1, fontWeight: "700" }}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        {mode === "community" && (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <Text style={{ color: C.ivory, fontSize: 22, fontWeight: "800", fontFamily: F.head }}>Community</Text>
            <Pressable onPress={() => router.push("/giveaway")} style={{ borderWidth: 1, borderColor: C.gold, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 12 }}><Text style={{ color: C.gold, fontSize: 9, fontFamily: F.mono, letterSpacing: 1 }}>🎁 GIVEAWAY</Text></Pressable>
          </View>
        )}
        {mode === "board" && <Text style={{ color: C.ivory, fontSize: 22, fontWeight: "800", fontFamily: F.head, marginTop: 8 }}>Announcements</Text>}

        {mode === "guild" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <Text style={{ color: C.ivory, fontSize: 22, fontWeight: "800", fontFamily: F.head }} numberOfLines={1}>{guildName}</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {(["chat", "roster"] as const).map((v) => (
                  <Pressable key={v} onPress={() => setView(v)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: view === v ? C.gold : C.line, backgroundColor: view === v ? C.gold : "transparent", borderRadius: 12 }}>
                    <Text style={{ color: view === v ? C.black : C.muted, fontSize: 9, letterSpacing: 1, fontWeight: "700" }}>{v === "chat" ? "CHAT" : "RANKS"}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {guilds.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginTop: 8 }} contentContainerStyle={{ gap: 8 }}>
                {guilds.map((g) => (
                  <Pressable key={g.id} onPress={() => selectGuild(g)} style={{ paddingVertical: 5, paddingHorizontal: 11, borderWidth: 1, borderColor: guildId === g.id ? C.gold : C.line, backgroundColor: guildId === g.id ? "rgba(201,169,97,0.12)" : "transparent", borderRadius: 12 }}>
                    <Text style={{ color: guildId === g.id ? C.gold : C.muted, fontSize: 10, fontFamily: F.mono }}>{g.tag ? `[${g.tag}] ` : ""}{g.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Pressable onPress={() => router.push("/guilds")} style={{ marginTop: 8 }}>
              <Text style={{ color: C.gold, fontSize: 10, fontFamily: F.mono, letterSpacing: 1 }}>＋ BROWSE / JOIN GUILDS</Text>
            </Pressable>
          </>
        )}
      </View>

      {showRoster ? (
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <Text style={{ color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 12 }}>THE LEADERBOARD · {roster.length} {roster.length === 1 ? "BROTHER" : "BROTHERS"}</Text>
          {roster.map((m, i) => (
            <Pressable key={m.user_id} onPress={() => m.user_id !== userId && openProfile(m.user_id)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
              <Text style={{ color: i < 3 ? C.gold : C.muted, fontSize: 16, fontWeight: "800", fontFamily: F.head, width: 34 }}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: m.user_id === userId ? C.gold : C.ivory, fontSize: 15, fontWeight: "600" }}>{m.name || "Brother"}{m.user_id === userId ? " (you)" : ""}</Text>
                <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 1, marginTop: 2 }}>{(m.cls || "Pilgrim").toUpperCase()} · {rankForLevel(levelFromXp(Number(m.xp) || 0)).toUpperCase()} · {Number(m.streak) || 0}d</Text>
              </View>
              <Text style={{ color: C.gold, fontSize: 14, fontWeight: "700" }}>{Number(m.xp) || 0} XP</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90} style={{ flex: 1 }}>
          {mode === "guild" && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
              {channels.map((c) => (
                <Pressable key={c.id} onPress={() => setActive(c)} style={{ paddingVertical: 7, paddingHorizontal: 13, borderWidth: 1, borderColor: active?.id === c.id ? C.gold : C.line, backgroundColor: active?.id === c.id ? C.gold : "transparent", borderRadius: 12 }}>
                  <Text style={{ color: active?.id === c.id ? C.black : C.ivory, fontSize: 12, fontFamily: F.bodyMid }}>#{c.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }}>
            {messages.length === 0 && <Text style={{ color: C.muted, fontSize: 13, textAlign: "center", marginTop: 30 }}>{mode === "board" ? "No announcements yet." : mode === "community" ? "Say hello. Meet a brother." : `No words yet in #${active?.name}. Break the silence.`}</Text>}
            {messages.map((m) => {
              const mine = m.author_id === userId;
              const media = parseMedia(m.body);
              return (
                <Pressable key={m.id} onLongPress={() => onMessagePress(m)} delayLongPress={300} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%", marginBottom: 10 }}>
                  <Text style={{ color: mine ? C.gold : C.muted, fontSize: 10, letterSpacing: 1, marginBottom: 3, textAlign: mine ? "right" : "left" }}>{mine ? "YOU" : (m.author_id ? nameMap[m.author_id] ?? "Brother" : "System").toUpperCase()}</Text>
                  {media ? <MediaBubble media={media} /> : (
                    <View style={{ backgroundColor: mode === "board" ? "rgba(201,169,97,0.10)" : mine ? "rgba(201,169,97,0.12)" : C.surface2, borderWidth: 1, borderColor: mode === "board" ? C.gold : C.line, padding: 11, borderRadius: 12 }}>
                      <Text style={{ color: C.ivory, fontSize: 14, lineHeight: 20 }}>{m.body}</Text>
                    </View>
                  )}
                  {reactions[m.id] && Object.keys(reactions[m.id].counts).length > 0 && (
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 4, alignSelf: mine ? "flex-end" : "flex-start" }}>
                      {Object.entries(reactions[m.id].counts).map(([emoji, n]) => (
                        <Pressable key={emoji} onPress={() => react(m, emoji)} style={{ flexDirection: "row", gap: 3, borderWidth: 1, borderColor: reactions[m.id].mine.includes(emoji) ? C.gold : C.line, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 11 }}>{emoji}</Text><Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono }}>{n}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {canPost ? (
            <View style={{ flexDirection: "row", gap: 6, padding: 12, borderTopWidth: 1, borderTopColor: C.line, alignItems: "center" }}>
              <Pressable onPress={attach} hitSlop={6} style={{ justifyContent: "center", paddingHorizontal: 4 }}><Text style={{ color: C.gold, fontSize: 24 }}>＋</Text></Pressable>
              <TextInput value={input} onChangeText={setInput} placeholder={mode === "board" ? "Post an announcement…" : mode === "community" ? "Message the community" : `Message #${active?.name ?? ""}`} placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 }} onSubmitEditing={send} returnKeyType="send" />
              <Pressable onPress={send} style={{ backgroundColor: C.gold, paddingHorizontal: 16, justifyContent: "center", borderRadius: 12 }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head }}>{mode === "board" ? "POST" : "SEND"}</Text></Pressable>
            </View>
          ) : (
            <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: C.line, alignItems: "center" }}>
              <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body }}>Only TABOR staff can post here. Watch this space.</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}

      <Modal visible={!!profileUser} transparent animationType="fade" onRequestClose={() => setProfileUser(null)}>
        <Pressable onPress={() => setProfileUser(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 30 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: C.surface2, borderWidth: 1, borderColor: C.gold, borderRadius: 14, padding: 24, alignItems: "center" }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Text style={{ color: C.gold, fontFamily: F.head, fontSize: 26 }}>{(profileUser?.name || "B")[0].toUpperCase()}</Text>
            </View>
            <Text style={{ color: C.ivory, fontSize: 20, fontFamily: F.head }}>{profileUser?.name || "Brother"}</Text>
            <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.mono, marginTop: 2 }}>@{profileUser?.handle}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {profileUser?.cls ? <Badge text={String(profileUser.cls)} /> : null}
              {profileUser?.denomination ? <Badge text={String(profileUser.denomination)} /> : null}
              <Badge text={`LVL ${levelFromXp(Number(profileUser?.xp) || 0)} · ${rankForLevel(levelFromXp(Number(profileUser?.xp) || 0))}`} />
            </View>
            {profileUser?.bio ? <Text style={{ color: C.text, fontSize: 14, fontFamily: F.body, textAlign: "center", marginTop: 14, lineHeight: 20 }}>{profileUser.bio}</Text> : null}
            {profileUser && profileUser.user_id !== userId && (
              profileUser.friend_status === "accepted" ? (
                <Pressable onPress={async () => { const u = profileUser; setProfileUser(null); const tid = await openDm(u.user_id); if (tid) router.push(`/dm/${tid}?name=${encodeURIComponent(u.name || "Brother")}&uid=${u.user_id}`); }} style={{ backgroundColor: C.gold, paddingVertical: 12, paddingHorizontal: 34, borderRadius: 12, marginTop: 18 }}>
                  <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>MESSAGE</Text>
                </Pressable>
              ) : profileUser.friend_status === "pending" ? (
                <View style={{ borderWidth: 1, borderColor: C.line, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, marginTop: 18 }}>
                  <Text style={{ color: C.muted, fontFamily: F.mono, fontSize: 11, letterSpacing: 1 }}>REQUEST PENDING</Text>
                </View>
              ) : (
                <Pressable onPress={async () => { if (!profileUser) return; const r = await sendFriendRequest(profileUser.user_id); setProfileUser((p) => (p ? { ...p, friend_status: r === "sent" ? "pending" : p.friend_status } : p)); sheet({ title: r === "sent" ? "Request sent" : "Done", message: r === "sent" ? "They will see your request. Once they accept, you can message." : undefined, actions: [{ label: "Got it", style: "cancel" }] }); }} style={{ backgroundColor: C.gold, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, marginTop: 18 }}>
                  <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>＋ ADD FRIEND</Text>
                </Pressable>
              )
            )}
            <Text style={{ color: C.muted, fontSize: 9, fontFamily: F.mono, marginTop: 16 }}>TAP OUTSIDE TO CLOSE</Text>
          </Pressable>
        </Pressable>
      </Modal>
      <GifPicker visible={gifOpen} onClose={() => setGifOpen(false)} onPick={sendGif} />
      <EmojiPicker visible={!!emojiFor} recents={recents} onPick={(e) => { if (emojiFor) doReact(emojiFor, e); setEmojiFor(null); }} onClose={() => setEmojiFor(null)} />
    </SafeAreaView>
  );
}

function Badge({ text }: { text: string }) {
  return <View style={{ borderWidth: 1, borderColor: C.line, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 10 }}><Text style={{ color: C.gold, fontSize: 9, fontFamily: F.mono, letterSpacing: 0.5 }}>{text.toUpperCase()}</Text></View>;
}
