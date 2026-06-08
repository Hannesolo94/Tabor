import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getActiveGiveaway, voteGiveaway, standForGiveaway, type Giveaway } from "@/lib/giveaway";
import { Seal } from "@/components/Seal";
import { C, F } from "@/lib/theme";

export default function GiveawayScreen() {
  const router = useRouter();
  const [g, setG] = useState<Giveaway | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() { setG(await getActiveGiveaway()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function vote(nomineeId: string) {
    if (!g || busy) return;
    setBusy(true); await voteGiveaway(g.id, nomineeId); await load(); setBusy(false);
  }
  async function stand() {
    if (!g || busy) return;
    setBusy(true); await standForGiveaway(g.id); await load(); setBusy(false);
  }

  const totalVotes = g?.nominees.reduce((s, n) => s + n.votes, 0) ?? 0;
  const closesIn = g?.closes_at ? Math.max(0, Math.ceil((new Date(g.closes_at).getTime() - Date.now()) / 86400000)) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>The Giveaway</Text>
      </View>
      {loading ? <ActivityIndicator color={C.gold} style={{ marginTop: 40 }} /> : !g ? (
        <View style={{ padding: 30, alignItems: "center" }}><Text style={{ color: C.muted, fontFamily: F.body }}>No giveaway running right now. Check back soon.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
          <View style={{ alignItems: "center", marginBottom: 18 }}>
            <Seal size={50} />
            <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono, marginTop: 12 }}>[ {g.month} DRAW ]</Text>
            <Text style={{ color: C.ivory, fontSize: 22, fontFamily: F.head, textAlign: "center", marginTop: 6 }}>{g.prize}</Text>
            {closesIn !== null && <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body, marginTop: 6 }}>Closes in {closesIn} day{closesIn === 1 ? "" : "s"}. Free to enter.</Text>}
          </View>

          {!g.am_nominee && (
            <Pressable onPress={stand} style={{ borderWidth: 1, borderColor: C.gold, paddingVertical: 13, alignItems: "center", borderRadius: 2, marginBottom: 18 }}>
              <Text style={{ color: C.gold, fontFamily: F.headMid, letterSpacing: 1 }}>STAND FOR NOMINATION</Text>
            </Pressable>
          )}

          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginBottom: 10 }}>NOMINEES · VOTE FOR ONE</Text>
          {g.nominees.length === 0 ? (
            <Text style={{ color: C.muted, fontFamily: F.body, fontSize: 13 }}>No one has stood yet. Be the first.</Text>
          ) : g.nominees.map((n) => {
            const mine = g.my_vote === n.user_id;
            const pct = totalVotes ? Math.round((n.votes / totalVotes) * 100) : 0;
            return (
              <Pressable key={n.user_id} onPress={() => vote(n.user_id)} disabled={busy} style={{ borderWidth: 1, borderColor: mine ? C.gold : C.line, backgroundColor: C.surface2, borderRadius: 2, padding: 14, marginBottom: 10, overflow: "hidden" }}>
                <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, backgroundColor: "rgba(201,169,97,0.10)" }} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.bodyMid }}>{n.name}</Text>
                    {n.cls && <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono }}>{n.cls.toUpperCase()}</Text>}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: mine ? C.gold : C.text, fontSize: 14, fontFamily: F.mono }}>{n.votes} {n.votes === 1 ? "vote" : "votes"}</Text>
                    {mine && <Text style={{ color: C.gold, fontSize: 10, fontWeight: "700", letterSpacing: 1, fontFamily: F.mono }}>✓ YOUR VOTE</Text>}
                  </View>
                </View>
              </Pressable>
            );
          })}
          <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, fontFamily: F.body, marginTop: 14 }}>One vote per brother. Free to enter, no purchase needed. Winners announced when the draw closes.</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
