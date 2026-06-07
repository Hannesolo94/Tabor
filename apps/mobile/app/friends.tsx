import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ensureHandle, searchUsers, listFriends, sendFriendRequest, respondFriend, openDm, blockUser, type FriendRow, type SearchRow } from "@/lib/social";
import { C, F } from "@/lib/theme";

export default function Friends() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  async function refresh() { setFriends(await listFriends()); }
  useEffect(() => { (async () => { setHandle(await ensureHandle()); await refresh(); setLoading(false); })(); }, []);

  async function runSearch() {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true); setResults(await searchUsers(q.trim())); setSearching(false);
  }

  async function add(u: SearchRow) {
    const r = await sendFriendRequest(u.user_id);
    Alert.alert(r === "sent" ? "Request sent" : r === "exists" ? "Already connected or pending" : r === "blocked" ? "Unavailable" : "Done", r === "sent" ? `${u.name || u.handle} will see your request.` : "");
    setResults((rs) => rs.filter((x) => x.user_id !== u.user_id));
    refresh();
  }
  async function dm(f: FriendRow) {
    const tid = await openDm(f.other_id);
    if (tid) router.push(`/dm/${tid}?name=${encodeURIComponent(f.name || "Brother")}`);
  }
  function confirmBlock(f: FriendRow) {
    Alert.alert("Block this brother?", "They will be removed and can no longer reach you.", [
      { text: "Cancel", style: "cancel" },
      { text: "Block", style: "destructive", onPress: async () => { await blockUser(f.other_id); refresh(); } },
    ]);
  }

  const incoming = friends.filter((f) => f.status === "pending" && f.direction === "incoming");
  const outgoing = friends.filter((f) => f.status === "pending" && f.direction === "outgoing");
  const accepted = friends.filter((f) => f.status === "accepted");

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
        <View>
          <Text style={{ color: C.ivory, fontSize: 18, fontWeight: "800", fontFamily: F.head }}>Brothers</Text>
          <Text style={{ color: C.muted, fontSize: 10 }}>your handle: <Text style={{ color: C.gold }}>@{handle}</Text> · share to be added</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* add */}
        <Text style={sec}>FIND A BROTHER</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <TextInput value={q} onChangeText={setQ} onSubmitEditing={runSearch} placeholder="Search by name or @handle" placeholderTextColor={C.muted} autoCapitalize="none" style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 2 }} />
          <Pressable onPress={runSearch} style={{ backgroundColor: C.gold, paddingHorizontal: 16, justifyContent: "center", borderRadius: 2 }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head }}>FIND</Text></Pressable>
        </View>
        {searching && <ActivityIndicator color={C.gold} style={{ marginVertical: 8 }} />}
        {results.map((u) => (
          <Row key={u.user_id} title={u.name || "Brother"} sub={`@${u.handle} · ${(u.cls || "Pilgrim")}`} action="ADD" onAction={() => add(u)} />
        ))}

        {incoming.length > 0 && <><Text style={sec}>REQUESTS</Text>{incoming.map((f) => (
          <View key={f.id} style={card}>
            <View style={{ flex: 1 }}><Text style={{ color: C.ivory, fontSize: 15 }}>{f.name || "Brother"}</Text><Text style={{ color: C.muted, fontSize: 11 }}>@{f.handle} wants to connect</Text></View>
            <Pressable onPress={async () => { await respondFriend(f.id, true); refresh(); }} style={btnGold}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, fontSize: 11 }}>ACCEPT</Text></Pressable>
            <Pressable onPress={async () => { await respondFriend(f.id, false); refresh(); }} style={btnGhost}><Text style={{ color: C.muted, fontSize: 11 }}>DECLINE</Text></Pressable>
          </View>
        ))}</>}

        <Text style={sec}>YOUR BROTHERS ({accepted.length})</Text>
        {accepted.length === 0 && <Text style={{ color: C.muted, fontSize: 13 }}>No brothers yet. Find someone above. Works across any guild.</Text>}
        {accepted.map((f) => (
          <View key={f.id} style={card}>
            <View style={{ flex: 1 }}><Text style={{ color: C.ivory, fontSize: 15 }}>{f.name || "Brother"}</Text><Text style={{ color: C.muted, fontSize: 11 }}>@{f.handle} · {(f.cls || "Pilgrim")}</Text></View>
            <Pressable onPress={() => dm(f)} style={btnGold}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, fontSize: 11 }}>MESSAGE</Text></Pressable>
            <Pressable onPress={() => confirmBlock(f)} style={btnGhost}><Text style={{ color: C.muted, fontSize: 11 }}>BLOCK</Text></Pressable>
          </View>
        ))}

        {outgoing.length > 0 && <><Text style={sec}>PENDING</Text>{outgoing.map((f) => (
          <Row key={f.id} title={f.name || "Brother"} sub={`@${f.handle} · awaiting reply`} />
        ))}</>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ title, sub, action, onAction }: { title: string; sub: string; action?: string; onAction?: () => void }) {
  return (
    <View style={card}>
      <View style={{ flex: 1 }}><Text style={{ color: C.ivory, fontSize: 15 }}>{title}</Text><Text style={{ color: C.muted, fontSize: 11 }}>{sub}</Text></View>
      {action && <Pressable onPress={onAction} style={btnGold}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, fontSize: 11 }}>{action}</Text></Pressable>}
    </View>
  );
}

const sec = { color: C.gold, fontSize: 10, letterSpacing: 3, marginTop: 22, marginBottom: 10 } as const;
const card = { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line, padding: 12, marginBottom: 8, borderRadius: 2 };
const btnGold = { backgroundColor: C.gold, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 2 };
const btnGhost = { borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 2 };
