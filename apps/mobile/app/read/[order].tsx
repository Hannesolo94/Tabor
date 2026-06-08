import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getBooks, getChapter, getBookmarks, setBookmarks, getHighlights, setHighlights, removeHighlights, setLastRead, type Verse } from "@/lib/scripture";
import { addNote } from "@/lib/notes";
import { useActionSheet } from "@/components/ActionSheet";
import { C, F } from "@/lib/theme";

const HL_COLORS = ["#c9a961", "#6fa8dc", "#7bb274", "#c77b9e"];

export default function Reader() {
  const router = useRouter();
  const { order, c } = useLocalSearchParams<{ order: string; c?: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const sheet = useActionSheet();
  const bookOrder = Number(order);
  const [chapter, setChapter] = useState(Number(c) || 1);
  const [chapters, setChapters] = useState(1);
  const [book, setBook] = useState("");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<Set<string>>(new Set());
  const [highlights, setHls] = useState<Map<string, string>>(new Map());
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => { getBooks().then((bs) => { const b = bs.find((x) => x.book_order === bookOrder); if (b) { setBook(b.book); setChapters(b.chapters); } }); }, [bookOrder]);
  useEffect(() => {
    if (!userId) return;
    getBookmarks(userId).then((m) => setMarks(new Set(m)));
    getHighlights(userId).then((hs) => setHls(new Map(hs.map((h) => [h.ref, h.color]))));
  }, [userId]);
  useEffect(() => {
    setLoading(true); setSelected(new Set());
    getChapter(bookOrder, chapter).then((d) => { if (d.book) setBook(d.book); setVerses(d.verses); setLoading(false); });
  }, [bookOrder, chapter]);
  // remember where we left off
  useEffect(() => { if (userId && book) setLastRead(userId, { order: bookOrder, chapter, book }); }, [userId, book, bookOrder, chapter]);

  const refOf = (v: number) => `${book} ${chapter}:${v}`;
  function toggleSelect(v: number) {
    setSelected((s) => { const n = new Set(s); n.has(v) ? n.delete(v) : n.add(v); return n; });
  }
  const selRefs = () => [...selected].map(refOf);

  async function applyHighlight(color: string | null) {
    const refs = selRefs();
    setHls((m) => { const n = new Map(m); refs.forEach((r) => (color ? n.set(r, color) : n.delete(r))); return n; });
    if (userId) color ? await setHighlights(userId, refs, color) : await removeHighlights(userId, refs);
  }
  async function bookmarkSel() {
    const refs = selRefs();
    const allOn = refs.every((r) => marks.has(r));
    setMarks((s) => { const n = new Set(s); refs.forEach((r) => (allOn ? n.delete(r) : n.add(r))); return n; });
    if (userId) await setBookmarks(userId, refs, !allOn);
  }
  async function saveToNotes() {
    const nums = [...selected].sort((a, b) => a - b);
    if (!nums.length || !userId) return;
    const range = nums.length === 1 ? refOf(nums[0]) : `${book} ${chapter}:${nums[0]}-${nums[nums.length - 1]}`;
    const text = nums.map((n) => { const v = verses.find((x) => x.verse === n); return v ? `${n}. ${v.text}` : ""; }).filter(Boolean).join("\n");
    await addNote(userId, { cat: "scripture", title: range, body: text, ref: range });
    setSelected(new Set());
    sheet({ title: "Saved to Notes", message: `${range} is now in your Notes, under Word.`, actions: [{ label: "View Notes", onPress: () => router.push("/notes") }, { label: "Done", style: "cancel" }] });
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
            <Text style={{ color: chapter === n ? C.black : C.ivory, fontFamily: F.mono, fontSize: 13 }}>{n}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color={C.gold} style={{ marginTop: 30 }} /> : (
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: selected.size > 0 ? 180 : 50 }}>
          <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, marginBottom: 14, letterSpacing: 1 }}>TAP VERSES TO SELECT · HIGHLIGHT OR SAVE</Text>
          {verses.map((v) => {
            const ref = refOf(v.verse);
            const isSel = selected.has(v.verse);
            const hl = highlights.get(ref);
            const booked = marks.has(ref);
            return (
              <Pressable key={v.verse} onPress={() => toggleSelect(v.verse)} style={{ flexDirection: "row", marginBottom: 4, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 3, borderWidth: isSel ? 1 : 0, borderColor: C.gold, backgroundColor: isSel ? "rgba(201,169,97,0.16)" : hl ? hl + "2e" : "transparent" }}>
                <Text style={{ color: booked ? C.gold : C.muted, fontSize: 12, fontWeight: booked ? "800" : "400", fontFamily: F.mono, width: 26, marginTop: 5 }}>{booked ? "★" : v.verse}</Text>
                <Text style={{ color: C.text, fontSize: 17, lineHeight: 27, fontFamily: F.scripture, flex: 1 }}>{v.text}</Text>
              </Pressable>
            );
          })}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
            <Pressable disabled={chapter <= 1} onPress={() => setChapter((n) => Math.max(1, n - 1))} style={{ opacity: chapter <= 1 ? 0.3 : 1, borderWidth: 1, borderColor: C.line, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 2 }}><Text style={{ color: C.gold, fontFamily: F.mono, fontSize: 11 }}>‹ PREV</Text></Pressable>
            <Pressable disabled={chapter >= chapters} onPress={() => setChapter((n) => Math.min(chapters, n + 1))} style={{ opacity: chapter >= chapters ? 0.3 : 1, borderWidth: 1, borderColor: C.line, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 2 }}><Text style={{ color: C.gold, fontFamily: F.mono, fontSize: 11 }}>NEXT ›</Text></Pressable>
          </View>
        </ScrollView>
      )}

      {selected.size > 0 && (
        <View style={{ position: "absolute", left: 12, right: 12, bottom: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.gold, borderRadius: 6, padding: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>{selected.size} VERSE{selected.size > 1 ? "S" : ""} SELECTED</Text>
            <Pressable onPress={() => setSelected(new Set())} hitSlop={10}><Text style={{ color: C.muted, fontSize: 18 }}>✕</Text></Pressable>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
            {HL_COLORS.map((col) => (
              <Pressable key={col} onPress={() => applyHighlight(col)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: col, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }} />
            ))}
            <Pressable onPress={() => applyHighlight(null)} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" }}><Text style={{ color: C.muted, fontSize: 15 }}>⌫</Text></Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={bookmarkSel} style={{ flex: 1, borderWidth: 1, borderColor: C.line, paddingVertical: 12, alignItems: "center", borderRadius: 2 }}><Text style={{ color: C.ivory, fontSize: 12, fontFamily: F.mono, letterSpacing: 1 }}>★ BOOKMARK</Text></Pressable>
            <Pressable onPress={saveToNotes} style={{ flex: 1.5, backgroundColor: C.gold, paddingVertical: 12, alignItems: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontSize: 12, fontFamily: F.head, letterSpacing: 1 }}>SAVE TO NOTES</Text></Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
