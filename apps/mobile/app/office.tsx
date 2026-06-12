import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { traditionOf, orthodoxCalendarOf } from "@/lib/disciplines";
import { dailyOffice, type DailyOffice } from "@/lib/office";
import { C, F } from "@/lib/theme";

export default function Office() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [office, setOffice] = useState<DailyOffice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let denom: string | null = null, pref: string | null = null;
      if (userId) {
        const { data } = await supabase.from("profiles").select("denomination, orthodox_calendar").eq("user_id", userId).maybeSingle();
        denom = data?.denomination ?? null;
        pref = (data as { orthodox_calendar?: string | null })?.orthodox_calendar ?? null;
      }
      setOffice(dailyOffice(new Date(), traditionOf(denom), orthodoxCalendarOf(denom, pref) === "old"));
      setLoading(false);
    })();
  }, [userId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
      </View>
      {loading || !office ? (
        <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 0, paddingBottom: 60 }}>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono }}>{office.eyebrow}</Text>
          <Text style={{ color: C.ivory, fontSize: 30, fontFamily: F.head, marginTop: 8 }}>{office.title}</Text>
          {office.season ? <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, letterSpacing: 1, marginTop: 6 }}>{office.season.toUpperCase()}</Text> : null}
          <Text style={{ color: C.muted, fontSize: 14, fontFamily: F.body, marginTop: 10, lineHeight: 20 }}>{office.intro}</Text>

          <View style={{ marginTop: 22, gap: 14 }}>
            {office.sections.map((s, i) => (
              <View key={i} style={{ borderWidth: 1, borderColor: C.glassBorder, backgroundColor: C.surface2, borderRadius: 16, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 5 }}>
                <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginBottom: 10 }}>{s.label}</Text>
                <Text style={{ color: C.text, fontSize: 16, fontFamily: F.body, lineHeight: 27 }}>{s.body}</Text>
              </View>
            ))}
          </View>
          <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, textAlign: "center", marginTop: 28, letterSpacing: 2 }}>+ AMEN +</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
