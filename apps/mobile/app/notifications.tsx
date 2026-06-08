import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { C, F } from "@/lib/theme";

interface Note { id: string; kind: string | null; title: string | null; body: string | null; read: boolean; created_at: string; deep_link: string | null }

export default function Notifications() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase.from("notifications").select("id, kind, title, body, read, created_at, deep_link").eq("user_id", userId).order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      setNotes((data as Note[]) ?? []);
      setLoading(false);
    });
  }, [userId]);

  function markRead(n: Note) {
    if (n.read) return;
    setNotes((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    supabase.from("notifications").update({ read: true }).eq("id", n.id).then(() => {});
  }
  function open(n: Note) {
    markRead(n);
    if (n.deep_link && n.deep_link.startsWith("/")) router.push(n.deep_link);
  }
  function markAll() {
    setNotes((prev) => prev.map((x) => ({ ...x, read: true })));
    if (userId) supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false).then(() => {});
  }

  const unread = notes.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
          <Text style={{ color: C.ivory, fontSize: 18, fontWeight: "800", fontFamily: F.head }}>Inbox{unread > 0 ? ` · ${unread}` : ""}</Text>
        </View>
        {unread > 0 && <Pressable onPress={markAll} hitSlop={8}><Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>MARK ALL READ</Text></Pressable>}
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {notes.length === 0 && <Text style={{ color: C.muted, fontSize: 14, textAlign: "center", marginTop: 30 }}>No messages yet. Announcements from the brotherhood land here.</Text>}
          {notes.map((n) => (
            <Pressable key={n.id} onPress={() => open(n)} style={{ borderWidth: 1, borderColor: n.read ? C.line : C.gold, backgroundColor: n.read ? C.surface2 : "rgba(201,169,97,0.08)", padding: 15, marginBottom: 10, borderRadius: 2 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  {!n.read && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.gold }} />}
                  <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 2 }}>{(n.kind || "NOTICE").toUpperCase()}</Text>
                </View>
                <Text style={{ color: C.muted, fontSize: 10 }}>{new Date(n.created_at).toISOString().slice(0, 10)}</Text>
              </View>
              <Text style={{ color: C.ivory, fontSize: 17, fontWeight: "700" }}>{n.title}</Text>
              {n.body ? <Text style={{ color: C.text, fontSize: 14, lineHeight: 21, marginTop: 5 }}>{n.body}</Text> : null}
              <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, marginTop: 8 }}>{n.deep_link ? "TAP TO OPEN →" : n.read ? "READ" : "TAP TO MARK READ"}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
