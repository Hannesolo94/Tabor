import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { browseGuilds, joinGuild, myGuilds, createGuild, type GuildRow } from "@/lib/social";
import { C, F } from "@/lib/theme";

const GUIDELINES = "Guilds are brotherhoods under Christ. Keep it honoring: no hate, harassment, or filth. Lead well, sharpen each other.";

export default function Guilds() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [all, setAll] = useState<GuildRow[]>([]);
  const [mine, setMine] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    const [a, m] = await Promise.all([browseGuilds(), userId ? myGuilds(userId) : Promise.resolve([])]);
    setAll(a); setMine(m.map((g) => g.id)); setLoading(false);
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [userId]);

  async function join(g: GuildRow) {
    if (!userId) return;
    await joinGuild(g.id, userId);
    setMine((p) => [...p, g.id]);
  }
  async function create() {
    if (!name.trim() || !userId) return;
    setCreating(true);
    const gid = await createGuild(name.trim(), tag.trim());
    setCreating(false);
    if (gid) { setName(""); setTag(""); await refresh(); Alert.alert("Guild forged", `${name.trim()} is live. You lead it.`); }
    else Alert.alert("Could not create guild", "Try again.");
  }

  if (loading) return <SafeAreaView style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 22 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontWeight: "800", fontFamily: F.head }}>Guilds</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>JOIN A GUILD</Text>
        {all.map((g) => {
          const joined = mine.includes(g.id);
          return (
            <View key={g.id} style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface2, borderWidth: 1, borderColor: C.glassBorder, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 6, padding: 14, marginBottom: 8, borderRadius: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.ivory, fontSize: 16, fontWeight: "700" }}>{g.name} <Text style={{ color: C.muted, fontSize: 11 }}>· {g.tag}</Text></Text>
                <Text style={{ color: C.muted, fontSize: 11 }}>Open guild</Text>
              </View>
              {joined ? <Text style={{ color: C.green, fontSize: 10, letterSpacing: 1 }}>● JOINED</Text>
                : <Pressable onPress={() => join(g)} style={{ backgroundColor: C.gold, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, fontSize: 11 }}>JOIN</Text></Pressable>}
            </View>
          );
        })}

        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, marginTop: 24, marginBottom: 8 }}>FORGE YOUR OWN</Text>
        <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18, marginBottom: 12 }}>{GUIDELINES}</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Guild name" placeholderTextColor={C.muted} style={inp} />
        <TextInput value={tag} onChangeText={setTag} placeholder="Tag (e.g. IV, ZA, FIRE)" placeholderTextColor={C.muted} autoCapitalize="characters" maxLength={5} style={inp} />
        <Pressable onPress={create} disabled={creating} style={{ backgroundColor: C.gold, paddingVertical: 14, alignItems: "center", borderRadius: 12, marginTop: 6, opacity: creating ? 0.6 : 1 }}>
          <Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, letterSpacing: 2 }}>{creating ? "FORGING…" : "CREATE GUILD"}</Text>
        </Pressable>
        <Text style={{ color: C.muted, fontSize: 11, textAlign: "center", marginTop: 10 }}>By creating a guild you agree to uphold the community guidelines.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const inp = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 10, borderRadius: 12 } as const;
