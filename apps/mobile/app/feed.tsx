// Brotherhood Feed: Content-Studio posts that target the app. Cards show the cover,
// caption, inline reactions and comment count; tap to open the full post.
import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, Image, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getFeed, reactToPost, REACTIONS, type FeedPost } from "@/lib/feed";
import { C, F } from "@/lib/theme";

export default function FeedScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const uid = session?.user?.id ?? "";
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getFeed(uid);
    setPosts(data); setLoading(false); setRefreshing(false);
  }, [uid]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function react(p: FeedPost, kind: string) {
    const mine = await reactToPost(p.id, uid, kind);
    setPosts((arr) => arr.map((x) => {
      if (x.id !== p.id) return x;
      const reactions = { ...x.reactions };
      if (x.myReaction) reactions[x.myReaction] = Math.max(0, (reactions[x.myReaction] ?? 1) - 1);
      if (mine) reactions[mine] = (reactions[mine] ?? 0) + 1;
      return { ...x, myReaction: mine, reactions, reactionCount: Object.values(reactions).reduce((s, n) => s + n, 0) };
    }));
  }

  const renderItem = ({ item: p }: { item: FeedPost }) => {
    const img = p.media.find((m) => m.kind === "image" || m.kind === "gif");
    const cover = p.cover_image || img?.url || p.media[0]?.poster_url || null;
    const isVideoCover = !cover && p.media[0]?.kind === "video";
    return (
      <Pressable onPress={() => router.push(`/feed/${p.id}`)} style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 18, marginBottom: 16, overflow: "hidden" }}>
        {/* media */}
        <View style={{ width: "100%", aspectRatio: 4 / 5, backgroundColor: "#0E0E12", alignItems: "center", justifyContent: "center" }}>
          {cover ? <Image source={{ uri: cover }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : null}
          {isVideoCover ? <Text style={{ fontSize: 44, color: C.gold }}>▶</Text> : null}
          {p.media.length > 1 ? (
            <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontFamily: F.mono, fontSize: 10, color: C.ivory }}>1/{p.media.length}</Text>
            </View>
          ) : null}
          <View style={{ position: "absolute", top: 10, left: 10, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: F.mono, fontSize: 9, color: C.gold, letterSpacing: 1, textTransform: "uppercase" }}>{p.type}</Text>
          </View>
        </View>
        {/* body */}
        <View style={{ padding: 14 }}>
          {p.title ? <Text style={{ fontFamily: F.head, fontSize: 18, color: C.ivory, marginBottom: 4 }}>{p.title}</Text> : null}
          {p.body || p.excerpt ? <Text numberOfLines={3} style={{ fontFamily: F.body, fontSize: 14, color: "#C3BDB1", lineHeight: 20 }}>{p.excerpt || p.body}</Text> : null}
          <Text style={{ fontFamily: F.mono, fontSize: 10, color: C.muted, marginTop: 8, letterSpacing: 0.5 }}>{(p.author || "TABOR").toUpperCase()}</Text>

          {/* reactions + comments */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8, flexWrap: "wrap" }}>
            {REACTIONS.map((r) => {
              const on = p.myReaction === r.kind; const count = p.reactions[r.kind] ?? 0;
              return (
                <Pressable key={r.kind} onPress={() => react(p, r.kind)} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: on ? C.gold : C.line, backgroundColor: on ? "rgba(201,169,97,0.12)" : "transparent" }}>
                  <Text style={{ fontSize: 13 }}>{r.glyph}</Text>
                  {count > 0 ? <Text style={{ fontFamily: F.mono, fontSize: 11, color: on ? C.gold : C.muted }}>{count}</Text> : null}
                </Pressable>
              );
            })}
            <Pressable onPress={() => router.push(`/feed/${p.id}`)} style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={{ fontSize: 13, color: C.muted }}>💬</Text>
              <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.muted }}>{p.commentCount}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ fontFamily: F.mono, fontSize: 13, color: C.muted }}>‹ BACK</Text></Pressable>
        <Text style={{ fontFamily: F.head, fontSize: 20, color: C.ivory, marginLeft: 14 }}>Brotherhood Feed</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.gold} />}
          ListEmptyComponent={<Text style={{ fontFamily: F.body, fontSize: 14, color: C.muted, textAlign: "center", marginTop: 40 }}>No posts yet. The first word is coming.</Text>}
        />
      )}
    </SafeAreaView>
  );
}
