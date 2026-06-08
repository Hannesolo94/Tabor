import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { C, F } from "@/lib/theme";

export default function Safety() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Safety Center</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Block title="A brotherhood of honor" body="TABOR has zero tolerance for hate, harassment, threats, sexual content, or any objectionable material. Treat every member with respect. Break this and you can be removed." />
        <Block title="How to report" body="Press and hold any message (in a guild or a DM) to report it. Reports reach our team and are reviewed promptly. You can also report a person from their profile." />
        <Block title="How to block" body="Open a brother's profile or hold their message and choose Block. They will no longer be able to reach you, and you won't see them. Blocks stay in place until you remove them." />
        <Block title="Your private messages" body="Direct messages are end-to-end encrypted. Only you and the person you're messaging can read them. If you receive something harmful, use Report on that message so our team can act." />
        <Pressable onPress={() => Linking.openURL("mailto:safety@tabor.quest?subject=Safety%20report")} style={btn}>
          <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>REPORT A SAFETY CONCERN</Text>
        </Pressable>
        <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body, marginTop: 10, lineHeight: 18 }}>
          To report child exploitation or illegal content, email safety@tabor.quest immediately. We report illegal content to the authorities as required by law.
        </Text>

        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginTop: 26, marginBottom: 10 }}>IF YOU ARE IN CRISIS</Text>
        <Text style={{ color: C.text, fontSize: 14, fontFamily: F.body, lineHeight: 22 }}>
          You are not alone, and your life has worth. Reach out:{"\n"}• South Africa (SADAG): 0800 567 567{"\n"}• US/Canada: call or text 988{"\n"}• UK & ROI: Samaritans 116 123{"\n"}• Or contact your local emergency services.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ color: C.ivory, fontSize: 16, fontFamily: F.headMid, marginBottom: 5 }}>{title}</Text>
      <Text style={{ color: C.text, fontSize: 14, lineHeight: 21, fontFamily: F.body }}>{body}</Text>
    </View>
  );
}
const btn = { backgroundColor: C.gold, paddingVertical: 14, alignItems: "center" as const, borderRadius: 12, marginTop: 8 };
