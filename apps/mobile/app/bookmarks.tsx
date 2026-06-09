import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getBookmarks, toggleBookmark, bookOrderFor } from "@/lib/scripture";
import { useActionSheet } from "@/components/ActionSheet";
import { C, F } from "@/lib/theme";

export default function Bookmarks() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [refs, setRefs] = useState<string[]>([]);
  const sheet = useActionSheet();

  async function load() { if (userId) setRefs(await getBookmarks(userId)); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  async function open(ref: string) {
    // ref like "John 3:16" or "1 John 3:16"
    const lastSpace = ref.lastIndexOf(" ");
    const book = ref.slice(0, lastSpace);
    const chap = ref.slice(lastSpace + 1).split(":")[0];
    const order = await bookOrderFor(book);
    if (order) router.push(`/read/${order}?c=${chap}`);
  }
  function remove(ref: string) {
    sheet({ title: "Remove bookmark?", message: ref, actions: [{ label: "Remove", style: "destructive", onPress: async () => { if (userId) { await toggleBookmark(userId, ref, false); load(); } } }] });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Saved Verses</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {refs.length === 0 ? (
          <Text style={{ color: C.muted, fontSize: 14, fontFamily: F.body, textAlign: "center", marginTop: 30 }}>No saved verses yet. Long-press a verse in the reader to save it.</Text>
        ) : refs.map((ref) => (
          <Pressable key={ref} onPress={() => open(ref)} onLongPress={() => remove(ref)} delayLongPress={350} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: C.glassBorder, backgroundColor: C.surface2, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 6, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.scripture }}>{ref}</Text>
            <Text style={{ color: C.gold, fontSize: 16 }}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
