import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { C, F } from "@/lib/theme";

interface Note { id: string; kind: string | null; title: string | null; body: string | null; read: boolean; created_at: string }

export default function Notifications() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase.from("notifications").select("id, kind, title, body, read, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      setNotes((data as Note[]) ?? []);
      setLoading(false);
      // mark unread as read
      const unread = (data ?? []).filter((n) => !n.read).map((n) => n.id);
      if (unread.length) supabase.from("notifications").update({ read: true }).in("id", unread);
    });
  }, [userId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontWeight: "800", fontFamily: F.head }}>Inbox</Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {notes.length === 0 && <Text style={{ color: C.muted, fontSize: 14, textAlign: "center", marginTop: 30 }}>No messages yet. Announcements from the brotherhood land here.</Text>}
          {notes.map((n) => (
            <View key={n.id} style={{ borderWidth: 1, borderColor: n.read ? C.line : C.gold, backgroundColor: C.surface2, padding: 15, marginBottom: 10, borderRadius: 2 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2 }}>{(n.kind || "NOTICE").toUpperCase()}</Text>
                <Text style={{ color: C.muted, fontSize: 9 }}>{new Date(n.created_at).toISOString().slice(0, 10)}</Text>
              </View>
              <Text style={{ color: C.ivory, fontSize: 16, fontWeight: "700" }}>{n.title}</Text>
              {n.body ? <Text style={{ color: C.text, fontSize: 14, lineHeight: 21, marginTop: 5 }}>{n.body}</Text> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
