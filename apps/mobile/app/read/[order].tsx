import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getBooks, getChapter, getBookmarks, toggleBookmark, type Verse } from "@/lib/scripture";
import { C, F } from "@/lib/theme";

export default function Reader() {
  const router = useRouter();
  const { order, c } = useLocalSearchParams<{ order: string; c?: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const bookOrder = Number(order);
  const [chapter, setChapter] = useState(Number(c) || 1);
  const [chapters, setChapters] = useState(1);
  const [book, setBook] = useState("");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<Set<string>>(new Set());

  useEffect(() => { getBooks().then((bs) => { const b = bs.find((x) => x.book_order === bookOrder); if (b) { setBook(b.book); setChapters(b.chapters); } }); }, [bookOrder]);
  useEffect(() => { if (userId) getBookmarks(userId).then((m) => setMarks(new Set(m))); }, [userId]);
  useEffect(() => {
    setLoading(true);
    getChapter(bookOrder, chapter).then((d) => { if (d.book) setBook(d.book); setVerses(d.verses); setLoading(false); });
  }, [bookOrder, chapter]);

  async function mark(v: number) {
    const ref = `${book} ${chapter}:${v}`;
    const on = !marks.has(ref);
    setMarks((s) => { const n = new Set(s); on ? n.add(ref) : n.delete(ref); return n; });
    if (userId) toggleBookmark(userId, ref, on);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>{book} {chapter}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: C.line }} contentContainerStyle={{ padding: 10, gap: 6 }}>
        {Array.from({ length: chapters }, (_, i) => i + 1).map((n) => (
          <Pressable key={n} onPress={() => setChapter(n)} style={{ width: 38, height: 38, borderRadius: 2, borderWidth: 1, borderColor: chapter === n ? C.gold : C.line, backgroundColor: chapter === n ? C.gold : "transparent", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: chapter === n ? C.black : C.muted, fontFamily: F.mono, fontSize: 12 }}>{n}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color={C.gold} style={{ marginTop: 30 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 50 }}>
          {verses.map((v) => {
            const ref = `${book} ${chapter}:${v.verse}`;
            const on = marks.has(ref);
            return (
              <Pressable key={v.verse} onLongPress={() => mark(v.verse)} delayLongPress={250} style={{ flexDirection: "row", marginBottom: 12 }}>
                <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, width: 26, marginTop: 4 }}>{v.verse}</Text>
                <Text style={{ color: on ? C.gold : C.text, fontSize: 17, lineHeight: 27, fontFamily: F.scripture, flex: 1 }}>{v.text}{on ? "  ★" : ""}</Text>
              </Pressable>
            );
          })}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
            <Pressable disabled={chapter <= 1} onPress={() => setChapter((n) => Math.max(1, n - 1))} style={{ opacity: chapter <= 1 ? 0.3 : 1, borderWidth: 1, borderColor: C.line, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 2 }}><Text style={{ color: C.gold, fontFamily: F.mono, fontSize: 11 }}>‹ PREV</Text></Pressable>
            <Pressable disabled={chapter >= chapters} onPress={() => setChapter((n) => Math.min(chapters, n + 1))} style={{ opacity: chapter >= chapters ? 0.3 : 1, borderWidth: 1, borderColor: C.line, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 2 }}><Text style={{ color: C.gold, fontFamily: F.mono, fontSize: 11 }}>NEXT ›</Text></Pressable>
          </View>
          <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, textAlign: "center", marginTop: 16 }}>HOLD A VERSE TO BOOKMARK</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
