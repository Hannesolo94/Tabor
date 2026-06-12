import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { traditionOf, orthodoxCalendarOf, type Tradition } from "@/lib/disciplines";
import { yearEvents, dayEvents, upcoming, isFastDay, iso } from "@/lib/calendar";
import { C, F } from "@/lib/theme";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WD = ["S", "M", "T", "W", "T", "F", "S"];
const FAST_COLOR = "#6E8CA8";
const utcOf = (n: Date) => new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
const addDays = (dt: Date, k: number) => new Date(dt.getTime() + k * 86400000);
const localToday = () => { const n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); };
const fmtFull = (dt: Date) => `${MONTHS[dt.getUTCMonth()].slice(0, 3)} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;

function gridFor(view: "month" | "week", cursor: Date): Date[] {
  if (view === "week") {
    const start = addDays(cursor, -cursor.getUTCDay());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }
  const first = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
  const start = addDays(first, -first.getUTCDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export default function Calendar() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [trad, setTrad] = useState<Tradition | null>(null);
  const [oldCal, setOldCal] = useState(false);
  const [oriental, setOriental] = useState(false);
  const [view, setView] = useState<"month" | "week">("month");
  const today = useMemo(localToday, []);
  const [cursor, setCursor] = useState<Date>(today);
  const [selected, setSelected] = useState<Date>(today);

  useEffect(() => {
    (async () => {
      let denom: string | null = null, pref: string | null = null;
      if (userId) { const { data } = await supabase.from("profiles").select("denomination, orthodox_calendar").eq("user_id", userId).maybeSingle(); denom = data?.denomination ?? null; pref = (data as { orthodox_calendar?: string | null })?.orthodox_calendar ?? null; }
      setTrad(traditionOf(denom));
      const cal = orthodoxCalendarOf(denom, pref);
      setOldCal(cal === "old");
      setOriental(cal === "oriental");
    })();
  }, [userId]);

  const cells = useMemo(() => gridFor(view, cursor), [view, cursor]);
  const feastDays = useMemo(() => {
    if (!trad || oriental) return new Set<string>();
    const years = new Set(cells.map((d) => d.getUTCFullYear()));
    const s = new Set<string>();
    for (const y of years) for (const e of yearEvents(y, trad, oldCal)) if (e.kind === "feast") s.add(e.start);
    return s;
  }, [trad, cells, oldCal, oriental]);

  const shift = (dir: number) => setCursor((c) => (view === "week" ? addDays(c, dir * 7) : new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + dir, 1))));
  const selEvents = trad && !oriental ? dayEvents(selected, trad, oldCal) : [];
  const next = trad && !oriental ? upcoming(today, trad, 8, oldCal) : [];
  const label = view === "month" ? `${MONTHS[cursor.getUTCMonth()]} ${cursor.getUTCFullYear()}` : `Week of ${fmtFull(addDays(cursor, -cursor.getUTCDay()))}`;
  const rows = view === "month" ? Array.from({ length: 6 }, (_, r) => cells.slice(r * 7, r * 7 + 7)) : [cells];

  if (!trad) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {(["month", "week"] as const).map((v) => (
            <Pressable key={v} onPress={() => setView(v)} style={{ paddingVertical: 6, paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: view === v ? C.gold : C.line, backgroundColor: view === v ? C.gold : "transparent" }}>
              <Text style={{ color: view === v ? C.black : C.muted, fontSize: 10, letterSpacing: 1, fontFamily: F.mono }}>{v.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 0, paddingBottom: 60 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono }}>[ THE CHURCH YEAR ]</Text>
        <Text style={{ color: C.ivory, fontSize: 26, fontFamily: F.head, marginTop: 6 }}>Liturgical Calendar</Text>
        {trad === "orthodox" && !oriental && (
          <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, marginTop: 4 }}>{oldCal ? "OLD CALENDAR (JULIAN)" : "NEW CALENDAR (REVISED JULIAN)"} · change in Settings</Text>
        )}
        {oriental && (
          <View style={{ marginTop: 14, borderWidth: 1, borderColor: C.gold, backgroundColor: "rgba(201,169,97,0.08)", borderRadius: 14, padding: 16 }}>
            <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 1, fontFamily: F.mono, marginBottom: 6 }}>ORIENTAL ORTHODOX</Text>
            <Text style={{ color: C.text, fontSize: 13, lineHeight: 20, fontFamily: F.body }}>Your communion (Coptic, Armenian, Ethiopian, Syriac and others) keeps its own calendar and fasts. A detailed liturgical calendar for your tradition is in development, so we are not showing Eastern Orthodox dates here, which would be inaccurate. Your prayers and disciplines still work as normal.</Text>
          </View>
        )}

        {/* nav + grid */}
        <View style={{ marginTop: 18, borderWidth: 1, borderColor: C.glassBorder, backgroundColor: C.surface2, borderRadius: 16, padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Pressable onPress={() => shift(-1)} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
            <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.headMid }}>{label}</Text>
            <Pressable onPress={() => shift(1)} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>›</Text></Pressable>
          </View>
          <View style={{ flexDirection: "row" }}>
            {WD.map((d, i) => <Text key={i} style={{ flex: 1, textAlign: "center", color: C.muted, fontSize: 10, fontFamily: F.mono }}>{d}</Text>)}
          </View>
          {rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: "row", marginTop: 4 }}>
              {row.map((day) => {
                const k = iso(day);
                const inMonth = view === "week" || day.getUTCMonth() === cursor.getUTCMonth();
                const isToday = k === iso(today);
                const isSel = k === iso(selected);
                const feast = feastDays.has(k);
                const fast = !oriental && isFastDay(day, trad, oldCal);
                return (
                  <Pressable key={k} onPress={() => setSelected(day)} style={{ flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: isSel ? "rgba(201,169,97,0.16)" : "transparent", borderWidth: isToday ? 1 : 0, borderColor: C.gold, margin: 1 }}>
                    <Text style={{ color: !inMonth ? C.line : isToday ? C.gold : C.ivory, fontSize: 13, fontFamily: F.mono }}>{day.getUTCDate()}</Text>
                    <View style={{ flexDirection: "row", gap: 2, height: 5, marginTop: 2 }}>
                      {feast ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.gold }} /> : null}
                      {fast ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: FAST_COLOR }} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View style={{ flexDirection: "row", gap: 16, marginTop: 12, justifyContent: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold }} /><Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono }}>FEAST</Text></View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: FAST_COLOR }} /><Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono }}>FAST</Text></View>
          </View>
        </View>

        {/* selected day */}
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono }}>{fmtFull(selected).toUpperCase()}</Text>
          {selEvents.length === 0 ? (
            <Text style={{ color: C.muted, fontSize: 14, fontFamily: F.body, marginTop: 8 }}>An ordinary day. Keep the rhythm of prayer.</Text>
          ) : selEvents.map((e, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: e.kind === "feast" ? C.gold : FAST_COLOR }} />
              <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.bodyMid, flex: 1 }}>{e.name}</Text>
              <Text style={{ color: C.muted, fontSize: 9, fontFamily: F.mono, letterSpacing: 1 }}>{e.kind.toUpperCase()}</Text>
            </View>
          ))}
          {selEvents.some((e) => e.kind === "feast") && (
            <Pressable onPress={() => router.push("/office")} style={{ marginTop: 14, borderWidth: 1, borderColor: `${C.gold}55`, borderRadius: 12, padding: 12, alignItems: "center" }}>
              <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>OPEN THE DAILY OFFICE ›</Text>
            </Pressable>
          )}
        </View>

        {/* upcoming */}
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginTop: 30 }}>UPCOMING · PREPARE</Text>
        <View style={{ marginTop: 10, gap: 2 }}>
          {next.map((e, i) => {
            const d = new Date(e.start + "T00:00:00Z");
            return (
              <Pressable key={i} onPress={() => { setSelected(d); setCursor(d); setView("month"); }} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderTopColor: "rgba(255,255,255,0.05)" }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: e.kind === "feast" ? C.gold : FAST_COLOR }} />
                <Text style={{ color: C.ivory, fontSize: 14, fontFamily: F.body, flex: 1 }} numberOfLines={1}>{e.name}</Text>
                <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono }}>{fmtFull(d).replace(`, ${d.getUTCFullYear()}`, "")}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
