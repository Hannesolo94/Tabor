import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VERSES, verseForDay, type Verse } from "@/lib/verses";
import { C } from "@/lib/theme";

const BM_KEY = "tabor.bookmarks";

export default function Word() {
  const today = verseForDay();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [tab, setTab] = useState<"today" | "armory" | "saved">("today");
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(BM_KEY).then((v) => { if (v) try { setBookmarks(JSON.parse(v)); } catch {} });
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fade]);

  const toggle = (ref: string) => {
    setBookmarks((b) => {
      const next = b.includes(ref) ? b.filter((x) => x !== ref) : [...b, ref];
      AsyncStorage.setItem(BM_KEY, JSON.stringify(next));
      return next;
    });
  };

  const saved = VERSES.filter((v) => bookmarks.includes(v.ref));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4 }}>[ SCRIPTURE RAID ]</Text>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", marginTop: 6 }}>The Word</Text>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 18 }}>
          {(["today", "armory", "saved"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ paddingVertical: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: tab === t ? C.gold : C.line, backgroundColor: tab === t ? C.gold : "transparent", borderRadius: 2 }}>
              <Text style={{ color: tab === t ? C.black : C.muted, fontSize: 10, letterSpacing: 1, fontWeight: "700" }}>{t === "today" ? "TODAY" : t === "armory" ? "THE ARMORY" : `SAVED (${saved.length})`}</Text>
            </Pressable>
          ))}
        </View>

        {tab === "today" && (
          <Animated.View style={{ opacity: fade }}>
            <View style={{ borderWidth: 1, borderColor: C.gold, backgroundColor: C.surface2, padding: 22, borderRadius: 2 }}>
              <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3 }}>{today.theme.toUpperCase()}</Text>
              <Text style={{ color: C.ivory, fontSize: 19, lineHeight: 30, marginTop: 14, fontWeight: "500" }}>{today.text}</Text>
              <Text style={{ color: C.gold, fontSize: 14, marginTop: 16, letterSpacing: 1 }}>— {today.ref}</Text>
            </View>
            <VerseActions v={today} saved={bookmarks.includes(today.ref)} onToggle={toggle} />
            <View style={{ marginTop: 22, borderLeftWidth: 3, borderLeftColor: C.line, paddingLeft: 16 }}>
              <Text style={{ color: C.muted, fontSize: 11, letterSpacing: 2 }}>REFLECT</Text>
              <Text style={{ color: C.text, fontSize: 15, lineHeight: 23, marginTop: 6 }}>Where does this passage meet you today? Carry one line of it into your training and your battles.</Text>
            </View>
          </Animated.View>
        )}

        {tab === "armory" && (
          <View>
            {VERSES.map((v) => <VerseRow key={v.ref} v={v} saved={bookmarks.includes(v.ref)} onToggle={toggle} />)}
          </View>
        )}

        {tab === "saved" && (
          saved.length === 0
            ? <Text style={{ color: C.muted, fontSize: 14 }}>No saved passages yet. Tap the bookmark on any verse.</Text>
            : saved.map((v) => <VerseRow key={v.ref} v={v} saved onToggle={toggle} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function VerseActions({ v, saved, onToggle }: { v: Verse; saved: boolean; onToggle: (r: string) => void }) {
  return (
    <Pressable onPress={() => onToggle(v.ref)} style={{ flexDirection: "row", alignItems: "center", marginTop: 14, alignSelf: "flex-start" }}>
      <Text style={{ color: saved ? C.gold : C.muted, fontSize: 16 }}>{saved ? "★" : "☆"}</Text>
      <Text style={{ color: saved ? C.gold : C.muted, fontSize: 12, letterSpacing: 1, marginLeft: 8 }}>{saved ? "SAVED" : "SAVE"}</Text>
    </Pressable>
  );
}

function VerseRow({ v, saved, onToggle }: { v: Verse; saved: boolean; onToggle: (r: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", paddingVertical: 14 }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2 }}>{v.theme.toUpperCase()}</Text>
          <Text style={{ color: C.ivory, fontSize: 15, marginTop: 3 }}>{v.ref}</Text>
        </View>
        <Pressable onPress={() => onToggle(v.ref)} hitSlop={10}><Text style={{ color: saved ? C.gold : C.muted, fontSize: 18 }}>{saved ? "★" : "☆"}</Text></Pressable>
      </Pressable>
      {open && <Text style={{ color: C.text, fontSize: 15, lineHeight: 23, marginTop: 10 }}>{v.text}</Text>}
    </View>
  );
}
