// Post detail: full media (carousel / video), caption, reactions, comments thread.
import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, Image, ScrollView, TextInput, FlatList, ActivityIndicator, useWindowDimensions, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAuth } from "@/lib/auth";
import { getPost, loadComments, addComment, deleteComment, reactToPost, REACTIONS, type FeedPost, type FeedComment } from "@/lib/feed";
import { C, F } from "@/lib/theme";

function VideoItem({ url, width }: { url: string; width: number }) {
  const player = useVideoPlayer(url, (p) => { p.loop = false; });
  return <VideoView player={player} style={{ width, aspectRatio: 4 / 5, backgroundColor: "#000" }} contentFit="cover" nativeControls allowsFullscreen />;
}

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const uid = session?.user?.id ?? "";
  const { width } = useWindowDimensions();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [p, c] = await Promise.all([getPost(id, uid), loadComments(id)]);
    setPost(p); setComments(c); setLoading(false);
  }, [id, uid]);
  useEffect(() => { load(); }, [load]);

  async function react(kind: string) {
    if (!post) return;
    const mine = await reactToPost(post.id, uid, kind);
    setPost((x) => {
      if (!x) return x;
      const reactions = { ...x.reactions };
      if (x.myReaction) reactions[x.myReaction] = Math.max(0, (reactions[x.myReaction] ?? 1) - 1);
      if (mine) reactions[mine] = (reactions[mine] ?? 0) + 1;
      return { ...x, myReaction: mine, reactions, reactionCount: Object.values(reactions).reduce((s, n) => s + n, 0) };
    });
  }
  async function send() {
    if (!post || !text.trim()) return;
    setSending(true);
    await addComment(post.id, uid, text);
    setText("");
    setComments(await loadComments(post.id));
    setSending(false);
  }
  async function remove(cid: string) {
    await deleteComment(cid);
    setComments((cs) => cs.filter((c) => c.id !== cid));
  }

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}><ActivityIndicator color={C.gold} style={{ marginTop: 40 }} /></SafeAreaView>;
  if (!post) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}><Text style={{ color: C.muted, fontFamily: F.body, textAlign: "center", marginTop: 40 }}>Post not found.</Text></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ fontFamily: F.mono, fontSize: 13, color: C.muted }}>‹ BACK</Text></Pressable>
        </View>
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={
            <View>
              {post.media.length > 0 ? (
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ width }}>
                  {post.media.map((m, i) => m.kind === "video"
                    ? <VideoItem key={i} url={m.url} width={width} />
                    : <Image key={i} source={{ uri: m.url }} style={{ width, aspectRatio: 4 / 5 }} resizeMode="cover" />)}
                </ScrollView>
              ) : post.cover_image ? <Image source={{ uri: post.cover_image }} style={{ width, aspectRatio: 4 / 5 }} resizeMode="cover" /> : null}
              <View style={{ padding: 16 }}>
                {post.title ? <Text style={{ fontFamily: F.head, fontSize: 24, color: C.ivory, marginBottom: 6 }}>{post.title}</Text> : null}
                {post.body || post.excerpt ? <Text style={{ fontFamily: F.body, fontSize: 15, color: "#C3BDB1", lineHeight: 23 }}>{post.body || post.excerpt}</Text> : null}
                <Text style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 10, letterSpacing: 0.5 }}>{(post.author || "TABOR").toUpperCase()}</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                  {REACTIONS.map((r) => {
                    const on = post.myReaction === r.kind; const count = post.reactions[r.kind] ?? 0;
                    return (
                      <Pressable key={r.kind} onPress={() => react(r.kind)} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: on ? C.gold : C.line, backgroundColor: on ? "rgba(201,169,97,0.12)" : "transparent" }}>
                        <Text style={{ fontSize: 15 }}>{r.glyph}</Text>
                        <Text style={{ fontFamily: F.mono, fontSize: 11, color: on ? C.gold : C.muted }}>{r.label}{count > 0 ? ` ${count}` : ""}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={{ fontFamily: F.mono, fontSize: 11, color: C.muted, letterSpacing: 1, marginTop: 22, marginBottom: 2 }}>COMMENTS · {comments.length}</Text>
              </View>
            </View>
          }
          renderItem={({ item: c }) => (
            <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {c.avatar_url ? <Image source={{ uri: c.avatar_url }} style={{ width: 32, height: 32 }} /> : <Text style={{ color: C.gold, fontFamily: F.head }}>{(c.name || "B")[0]}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.mono, fontSize: 11, color: C.gold }}>{c.name}</Text>
                <Text style={{ fontFamily: F.body, fontSize: 14, color: C.ivory, marginTop: 2 }}>{c.body}</Text>
              </View>
              {c.user_id === uid ? <Pressable onPress={() => remove(c.id)} hitSlop={8}><Text style={{ color: C.muted, fontSize: 16 }}>×</Text></Pressable> : null}
            </View>
          )}
          ListEmptyComponent={<Text style={{ fontFamily: F.body, fontSize: 13, color: C.muted, paddingHorizontal: 16 }}>Be the first to speak.</Text>}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.black }}>
          <TextInput value={text} onChangeText={setText} placeholder="Add a word…" placeholderTextColor={C.muted} style={{ flex: 1, fontFamily: F.body, fontSize: 14, color: C.ivory, backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }} />
          <Pressable onPress={send} disabled={sending || !text.trim()} style={{ backgroundColor: C.gold, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, opacity: sending || !text.trim() ? 0.5 : 1 }}>
            <Text style={{ fontFamily: F.head, color: C.black }}>POST</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
