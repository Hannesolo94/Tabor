import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "@/lib/useProfile";
import { useAuth } from "@/lib/auth";
import { levelProgress, RANKS } from "@/lib/game";
import { Seal } from "@/components/Seal";
import { C } from "@/lib/theme";

export default function Status() {
  const { profile } = useProfile();
  const { signOut } = useAuth();
  const xp = Number(profile?.xp ?? 0);
  const prog = levelProgress(xp);
  const streak = Number(profile?.streak ?? 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <View style={{ alignItems: "center", marginBottom: 8 }}>
          <Seal size={64} />
          <Text style={{ color: C.ivory, fontSize: 22, fontWeight: "800", marginTop: 12 }}>{profile?.name || "Brother"}</Text>
          <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 3, marginTop: 2 }}>{prog.rank.toUpperCase()}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <Stat label="LEVEL" value={String(prog.level)} />
          <Stat label="XP" value={String(xp)} />
          <Stat label="STREAK" value={`${streak}d`} />
        </View>

        <Text style={{ color: C.ivory, fontSize: 13, letterSpacing: 3, marginTop: 28, marginBottom: 10 }}>THE ASCENT</Text>
        {RANKS.map((r, i) => {
          const reached = RANKS.indexOf(prog.rank) >= i;
          const current = r === prog.rank;
          return (
            <View key={r} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
              <Text style={{ color: reached ? C.gold : C.muted, fontSize: 13, width: 28 }}>{reached ? "●" : "○"}</Text>
              <Text style={{ color: current ? C.gold : reached ? C.ivory : C.muted, fontSize: 15, fontWeight: current ? "800" : "400", flex: 1 }}>{r}</Text>
              {current && <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2 }}>YOU ARE HERE</Text>}
            </View>
          );
        })}

        <Pressable onPress={signOut} style={{ marginTop: 30, borderWidth: 1, borderColor: "rgba(192,58,58,0.4)", paddingVertical: 14, alignItems: "center", borderRadius: 2 }}>
          <Text style={{ color: C.red, fontSize: 12, letterSpacing: 2 }}>SIGN OUT</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 12, borderRadius: 2 }}>
      <Text style={{ color: C.muted, fontSize: 8, letterSpacing: 2 }}>{label}</Text>
      <Text style={{ color: C.gold, fontSize: 16, fontWeight: "800", marginTop: 3 }} numberOfLines={1}>{value}</Text>
    </View>
  );
}
