import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Switch, Alert, Linking, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { C, F } from "@/lib/theme";

const SITE = "https://tabor.quest";
const DONATE_OFF = "tabor.donate.off";

interface Prefs { push: { quests: boolean; guild: boolean; dm: boolean }; email: { quests: boolean } }
const DEFAULTS: Prefs = { push: { quests: true, guild: true, dm: true }, email: { quests: false } };

export default function Settings() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const userId = session?.user.id;

  async function exportData() {
    try {
      const { data } = await supabase.rpc("export_my_data");
      await Share.share({ message: JSON.stringify(data, null, 2) });
    } catch { Alert.alert("Could not export", "Please try again."); }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete your account?",
      "This permanently erases your profile, progress, messages, and all data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete everything", style: "destructive", onPress: async () => {
          try { await supabase.rpc("delete_my_account"); } catch { /* row already gone */ }
          await signOut();
        } },
      ],
    );
  }
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [supportReminder, setSupportReminder] = useState(true);

  useEffect(() => { AsyncStorage.getItem(DONATE_OFF).then((v) => setSupportReminder(v !== "1")); }, []);
  const toggleSupportReminder = (v: boolean) => { setSupportReminder(v); AsyncStorage.setItem(DONATE_OFF, v ? "0" : "1"); };

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("notif_prefs").eq("user_id", userId).maybeSingle().then(({ data }) => {
      const p = (data?.notif_prefs ?? {}) as Partial<Prefs>;
      setPrefs({ push: { ...DEFAULTS.push, ...(p.push ?? {}) }, email: { ...DEFAULTS.email, ...(p.email ?? {}) } });
      setLoaded(true);
    });
  }, [userId]);

  async function save(next: Prefs) {
    setPrefs(next);
    if (userId) await supabase.from("profiles").update({ notif_prefs: { ...next, announce: true } }).eq("user_id", userId);
  }
  const setPush = (k: keyof Prefs["push"], v: boolean) => save({ ...prefs, push: { ...prefs.push, [k]: v } });
  const setEmail = (k: keyof Prefs["email"], v: boolean) => save({ ...prefs, email: { ...prefs.email, [k]: v } });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Text style={sec}>ON YOUR PHONE</Text>
        <Row label="Daily quest reminder" on={prefs.push.quests} onChange={(v) => setPush("quests", v)} />
        <Row label="Guild activity" on={prefs.push.guild} onChange={(v) => setPush("guild", v)} />
        <Row label="Direct messages" on={prefs.push.dm} onChange={(v) => setPush("dm", v)} />
        <Locked label="Announcements" />

        <Text style={sec}>BY EMAIL</Text>
        <Row label="Daily quest reminder" on={prefs.email.quests} onChange={(v) => setEmail("quests", v)} />
        <Locked label="Announcements" />

        <Text style={{ color: C.muted, fontSize: 11.5, lineHeight: 18, fontFamily: F.body, marginTop: 20 }}>
          Announcements from the brotherhood are always delivered. Phone push activates with the published app; email reminders send once the email provider is connected.
        </Text>
        {!loaded ? null : null}

        <Text style={sec}>SUPPORT</Text>
        <Row label="Monthly support reminder" on={supportReminder} onChange={toggleSupportReminder} />

        <Text style={sec}>PRIVACY & DATA</Text>
        <LinkRow label="Download my data" onPress={exportData} />
        <LinkRow label="Privacy Policy" onPress={() => Linking.openURL(`${SITE}/privacy`)} />
        <LinkRow label="Terms & Community Guidelines" onPress={() => Linking.openURL(`${SITE}/terms`)} />

        <Text style={sec}>SAFETY & SUPPORT</Text>
        <LinkRow label="Report a problem" onPress={() => router.push("/report")} />
        <LinkRow label="Safety Center" onPress={() => router.push("/safety")} />
        <LinkRow label="Contact support" onPress={() => Linking.openURL("mailto:support@tabor.quest")} />

        <Text style={[sec, { color: C.red }]}>DANGER ZONE</Text>
        <Pressable onPress={confirmDelete} style={{ borderWidth: 1, borderColor: "rgba(192,58,58,0.5)", paddingVertical: 14, alignItems: "center", borderRadius: 12 }}>
          <Text style={{ color: C.red, fontSize: 13, letterSpacing: 1, fontFamily: F.mono }}>DELETE MY ACCOUNT</Text>
        </Pressable>
        <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, fontFamily: F.body, marginTop: 8 }}>Permanently erases your account and all your data. This cannot be undone.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
      <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.body }}>{label}</Text>
      <Switch value={on} onValueChange={onChange} trackColor={{ false: C.surface, true: C.gold }} thumbColor={C.ivory} />
    </View>
  );
}
function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
      <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.body }}>{label}</Text>
      <Text style={{ color: C.gold, fontSize: 16 }}>›</Text>
    </Pressable>
  );
}
function Locked({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
      <Text style={{ color: C.ivory, fontSize: 15, fontFamily: F.body }}>{label}</Text>
      <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 1, fontFamily: F.mono }}>🔒 LOCKED ON</Text>
    </View>
  );
}
const sec = { color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono, marginTop: 22, marginBottom: 8 } as const;
