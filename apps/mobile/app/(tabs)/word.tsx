import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/useProfile";
import { useTabBar } from "@/lib/tabbar";
import { verseForDay } from "@/lib/verses";
import { getBooks, getPlans, getProgress, listPrayers, addPrayer, togglePrayer, searchVerses, type BookInfo, type Plan, type Prayer } from "@/lib/scripture";
import { C, F } from "@/lib/theme";

export default function Word() {
  const tb = useTabBar();
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useProfile();
  const userId = session?.user.id;
  const [tab, setTab] = useState<"today" | "read" | "plans" | "prayer">("today");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono }}>[ SCRIPTURE RAID ]</Text>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", fontFamily: F.head, marginTop: 6 }}>The Word</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14, marginBottom: 6, flexWrap: "wrap" }}>
          {(["today", "read", "plans", "prayer"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ paddingVertical: 7, paddingHorizontal: 13, borderWidth: 1, borderColor: tab === t ? C.gold : C.line, backgroundColor: tab === t ? C.gold : "transparent", borderRadius: 2 }}>
              <Text style={{ color: tab === t ? C.black : C.muted, fontSize: 10, letterSpacing: 1, fontFamily: F.mono }}>{t.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === "today" && <Today onScroll={tb?.onScroll} />}
      {tab === "read" && <Read onScroll={tb?.onScroll} router={router} />}
      {tab === "plans" && <Plans onScroll={tb?.onScroll} router={router} userId={userId} faith={profile?.faith ?? profile?.believer} />}
      {tab === "prayer" && <PrayerJournal onScroll={tb?.onScroll} userId={userId} />}
    </SafeAreaView>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function Today({ onScroll }: { onScroll: any }) {
  const v = verseForDay();
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, [fade]);
  return (
    <ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
      <Animated.View style={{ opacity: fade }}>
        <View style={{ borderWidth: 1, borderColor: C.gold, backgroundColor: C.surface2, padding: 22, borderRadius: 2 }}>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono }}>{v.theme.toUpperCase()}</Text>
          <Text style={{ color: C.ivory, fontSize: 21, lineHeight: 32, marginTop: 14, fontFamily: F.scripture }}>{v.text}</Text>
          <Text style={{ color: C.gold, fontSize: 14, marginTop: 16, fontFamily: F.headMid }}>— {v.ref}</Text>
        </View>
        <View style={{ marginTop: 22, borderLeftWidth: 3, borderLeftColor: C.line, paddingLeft: 16 }}>
          <Text style={{ color: C.muted, fontSize: 11, letterSpacing: 2, fontFamily: F.mono }}>REFLECT</Text>
          <Text style={{ color: C.text, fontSize: 15, lineHeight: 23, marginTop: 6, fontFamily: F.body }}>Where does this passage meet you today? Carry one line of it into your training and your battles.</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function Read({ onScroll, router }: { onScroll: any; router: any }) {
  const [books, setBooks] = useState<BookInfo[]>([]);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ ref: string; book_order: number; chapter: number; text: string }[]>([]);
  useEffect(() => { getBooks().then(setBooks); }, []);
  async function run() { setResults(await searchVerses(q)); }
  const ot = books.filter((b) => b.book_order <= 39);
  const nt = books.filter((b) => b.book_order >= 40);
  const Grid = ({ list }: { list: BookInfo[] }) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {list.map((b) => (
        <Pressable key={b.book_order} onPress={() => router.push(`/read/${b.book_order}`)} style={{ borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 2 }}>
          <Text style={{ color: C.ivory, fontSize: 13, fontFamily: F.bodyMid }}>{b.book}</Text>
          <Text style={{ color: C.muted, fontSize: 9, fontFamily: F.mono }}>{b.chapters} ch</Text>
        </Pressable>
      ))}
    </View>
  );
  return (
    <ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}>
        <TextInput value={q} onChangeText={setQ} onSubmitEditing={run} placeholder="Search the Scriptures…" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 2, fontFamily: F.body }} />
        <Pressable onPress={run} style={{ backgroundColor: C.gold, paddingHorizontal: 16, justifyContent: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontFamily: F.head }}>GO</Text></Pressable>
      </View>
      {results.length > 0 ? (
        <>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginBottom: 10 }}>RESULTS</Text>
          {results.map((r, i) => (
            <Pressable key={i} onPress={() => router.push(`/read/${r.book_order}?c=${r.chapter}`)} style={{ borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)", paddingVertical: 11 }}>
              <Text style={{ color: C.gold, fontSize: 12, fontFamily: F.headMid }}>{r.ref}</Text>
              <Text style={{ color: C.text, fontSize: 13.5, lineHeight: 20, fontFamily: F.body, marginTop: 3 }} numberOfLines={2}>{r.text}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setResults([])} style={{ marginTop: 14 }}><Text style={{ color: C.muted, fontFamily: F.mono, fontSize: 11 }}>← back to books</Text></Pressable>
        </>
      ) : books.length === 0 ? <ActivityIndicator color={C.gold} style={{ marginTop: 20 }} /> : (
        <>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginBottom: 10 }}>OLD TESTAMENT</Text>
          <Grid list={ot} />
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginTop: 22, marginBottom: 10 }}>NEW TESTAMENT</Text>
          <Grid list={nt} />
        </>
      )}
    </ScrollView>
  );
}

function Plans({ onScroll, router, userId, faith }: { onScroll: any; router: any; userId?: string; faith: any }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [prog, setProg] = useState<Record<string, number>>({});
  const isSeeker = faith === "seeker" || faith === "seeking";
  useEffect(() => { getPlans().then(setPlans); if (userId) getProgress(userId).then(setProg); }, [userId]);
  const ordered = [...plans].sort((a, b) => (isSeeker ? (b.seeker ? 1 : 0) - (a.seeker ? 1 : 0) : 0) || a.id.localeCompare(b.id));
  return (
    <ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
      {ordered.map((p) => {
        const done = prog[p.id] ?? 0;
        return (
          <Pressable key={p.id} onPress={() => router.push(`/plan/${p.id}`)} style={{ borderWidth: 1, borderColor: p.seeker && isSeeker ? C.gold : C.line, backgroundColor: C.surface2, padding: 16, borderRadius: 2, marginBottom: 12 }}>
            {p.seeker ? <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2, fontFamily: F.mono, marginBottom: 4 }}>SEEKER TRACK</Text> : null}
            <Text style={{ color: C.ivory, fontSize: 17, fontFamily: F.headMid }}>{p.title}</Text>
            <Text style={{ color: C.muted, fontSize: 12.5, fontFamily: F.body, marginTop: 3 }}>{p.subtitle}</Text>
            <View style={{ height: 5, backgroundColor: C.surface, borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
              <View style={{ width: `${Math.round((done / p.days) * 100)}%`, height: "100%", backgroundColor: C.gold }} />
            </View>
            <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, marginTop: 5 }}>{done}/{p.days} DAYS</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function PrayerJournal({ onScroll, userId }: { onScroll: any; userId?: string }) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [body, setBody] = useState("");
  async function load() { if (userId) setPrayers(await listPrayers(userId)); }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);
  async function add() { if (!userId || !body.trim()) return; await addPrayer(userId, body.trim()); setBody(""); load(); }
  async function toggle(p: Prayer) { await togglePrayer(p.id, !p.answered); load(); }
  return (
    <ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}>
        <TextInput value={body} onChangeText={setBody} placeholder="Lift a prayer…" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 2, fontFamily: F.body }} />
        <Pressable onPress={add} style={{ backgroundColor: C.gold, paddingHorizontal: 16, justifyContent: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontFamily: F.head }}>ADD</Text></Pressable>
      </View>
      {prayers.length === 0 && <Text style={{ color: C.muted, fontSize: 14, fontFamily: F.body }}>No prayers yet. Bring them before the throne.</Text>}
      {prayers.map((p) => (
        <Pressable key={p.id} onPress={() => toggle(p)} style={{ borderWidth: 1, borderColor: p.answered ? C.green : C.line, backgroundColor: C.surface2, padding: 14, borderRadius: 2, marginBottom: 10 }}>
          <Text style={{ color: p.answered ? C.muted : C.ivory, fontSize: 14.5, lineHeight: 21, fontFamily: F.body, textDecorationLine: p.answered ? "line-through" : "none" }}>{p.body}</Text>
          <Text style={{ color: p.answered ? C.green : C.muted, fontSize: 9, letterSpacing: 1, fontFamily: F.mono, marginTop: 6 }}>{p.answered ? "● ANSWERED · tap to reopen" : "tap when answered"}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
