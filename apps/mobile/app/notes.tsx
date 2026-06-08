import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { listNotes, addNote, deleteNote, type Note } from "@/lib/notes";
import { C, F } from "@/lib/theme";

const CATS = [
  { v: "scripture", l: "Word" },
  { v: "fitness", l: "Body" },
  { v: "general", l: "General" },
];

export default function Notes() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [notes, setNotes] = useState<Note[]>([]);
  const [composing, setComposing] = useState(false);
  const [cat, setCat] = useState("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function load() { if (userId) setNotes(await listNotes(userId)); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  async function save() {
    if (!userId || !body.trim()) return;
    await addNote(userId, { cat, title: title.trim() || undefined, body: body.trim() });
    setTitle(""); setBody(""); setComposing(false); load();
  }
  function remove(n: Note) {
    Alert.alert("Delete note?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteNote(n.id); load(); } },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
          <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Notes</Text>
        </View>
        <Pressable onPress={() => setComposing((c) => !c)}><Text style={{ color: C.gold, fontSize: 13, fontFamily: F.mono }}>{composing ? "CLOSE" : "+ NEW"}</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {composing && (
          <View style={{ borderWidth: 1, borderColor: C.gold, borderRadius: 14, padding: 14, marginBottom: 18 }}>
            <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginBottom: 8 }}>CATEGORY</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.line }}>
              {CATS.map((c) => (
                <Pressable key={c.v} onPress={() => setCat(c.v)} style={{ borderWidth: 1, borderColor: cat === c.v ? C.gold : C.line, backgroundColor: cat === c.v ? C.gold : "transparent", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 }}>
                  <Text style={{ color: cat === c.v ? C.black : C.ivory, fontSize: 11, fontFamily: F.mono }}>{c.l.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput value={title} onChangeText={setTitle} placeholder="Title (optional)" placeholderTextColor={C.muted} style={inp} />
            <TextInput value={body} onChangeText={setBody} placeholder="Write it down..." placeholderTextColor={C.muted} multiline style={[inp, { height: 110, textAlignVertical: "top", marginTop: 8 }]} />
            <Pressable onPress={save} style={{ backgroundColor: C.gold, paddingVertical: 12, alignItems: "center", borderRadius: 12, marginTop: 10 }}>
              <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>SAVE</Text>
            </Pressable>
          </View>
        )}

        {notes.length === 0 && !composing && <Text style={{ color: C.muted, fontFamily: F.body, fontSize: 14, textAlign: "center", marginTop: 30 }}>No notes yet. Capture what the Spirit gives you.</Text>}
        {notes.map((n) => (
          <Pressable key={n.id} onLongPress={() => remove(n)} delayLongPress={350} style={{ borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, borderRadius: 14, padding: 14, marginBottom: 10 }}>
            <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2, fontFamily: F.mono }}>{(CATS.find((c) => c.v === n.cat)?.l ?? n.cat).toUpperCase()}{n.ref ? ` · ${n.ref}` : ""}</Text>
            {n.title ? <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.headMid, marginTop: 4 }}>{n.title}</Text> : null}
            <Text style={{ color: C.text, fontSize: 14, lineHeight: 20, fontFamily: F.body, marginTop: 3 }}>{n.body}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const inp = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, fontFamily: F.body, fontSize: 14 } as const;
