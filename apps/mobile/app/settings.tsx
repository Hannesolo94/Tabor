import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Switch, Linking, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useActionSheet } from "@/components/ActionSheet";
import { traditionOf, orthodoxCalendarOf, type Tradition, type OrthodoxCalendar } from "@/lib/disciplines";
import { syncLiturgicalReminders } from "@/lib/litReminders";
import { useUnits } from "@/lib/units";
import { C, F } from "@/lib/theme";

const SITE = "https://tabor.quest";
const DONATE_OFF = "tabor.donate.off";

interface Prefs { push: { quests: boolean; guild: boolean; dm: boolean; feasts: boolean }; email: { quests: boolean } }
const DEFAULTS: Prefs = { push: { quests: true, guild: true, dm: true, feasts: true }, email: { quests: false } };

export default function Settings() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const userId = session?.user.id;
  const sheet = useActionSheet();

  async function exportData() {
    try {
      const { data } = await supabase.rpc("export_my_data");
      await Share.share({ message: JSON.stringify(data, null, 2) });
    } catch { sheet({ title: "Could not export", message: "Please try again.", actions: [{ label: "Got it", style: "cancel" }] }); }
  }

  function confirmDelete() {
    sheet({
      title: "Delete your account?",
      message: "This permanently erases your profile, progress, messages, and all data. This cannot be undone.",
      actions: [
        { label: "Delete everything", style: "destructive", onPress: async () => {
          // verify the wipe actually happened before signing out. supabase.rpc resolves
          // with { error } on SQL/RLS failure (it does not throw), so we must check it.
          try {
            const { error } = await supabase.rpc("delete_my_account");
            if (error) throw error;
          } catch {
            sheet({ title: "Delete failed", message: "We could not erase your account, so nothing was deleted. Check your connection and try again, or contact support.", actions: [{ label: "Got it", style: "cancel" }] });
            return;
          }
          await signOut();
        } },
      ],
    });
  }
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [trad, setTrad] = useState<Tradition>("protestant");
  const [orthoCal, setOrthoCal] = useState<OrthodoxCalendar>("new");
  const [supportReminder, setSupportReminder] = useState(true);
  const u = useUnits();

  useEffect(() => { AsyncStorage.getItem(DONATE_OFF).then((v) => setSupportReminder(v !== "1")); }, []);
  const toggleSupportReminder = (v: boolean) => { setSupportReminder(v); AsyncStorage.setItem(DONATE_OFF, v ? "0" : "1"); };

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("notif_prefs, denomination, orthodox_calendar").eq("user_id", userId).maybeSingle().then(({ data }) => {
      const p = (data?.notif_prefs ?? {}) as Partial<Prefs>;
      setPrefs({ push: { ...DEFAULTS.push, ...(p.push ?? {}) }, email: { ...DEFAULTS.email, ...(p.email ?? {}) } });
      setTrad(traditionOf(data?.denomination ?? null));
      setOrthoCal(orthodoxCalendarOf(data?.denomination ?? null, (data as { orthodox_calendar?: string | null })?.orthodox_calendar));
      setLoaded(true);
    });
  }, [userId]);

  async function save(next: Prefs) {
    setPrefs(next);
    if (userId) await supabase.from("profiles").update({ notif_prefs: { ...next, announce: true } }).eq("user_id", userId);
  }
  const setPush = (k: keyof Prefs["push"], v: boolean) => save({ ...prefs, push: { ...prefs.push, [k]: v } });
  const setEmail = (k: keyof Prefs["email"], v: boolean) => save({ ...prefs, email: { ...prefs.email, [k]: v } });
  const setFeasts = (v: boolean) => { setPush("feasts", v); syncLiturgicalReminders(v, trad, orthoCal === "old", orthoCal === "oriental").catch(() => {}); };
  async function pickOrthoCal(c: OrthodoxCalendar) {
    setOrthoCal(c);
    if (userId) await supabase.from("profiles").update({ orthodox_calendar: c }).eq("user_id", userId);
    syncLiturgicalReminders(prefs.push.feasts, trad, c === "old", c === "oriental").catch(() => {});
  }

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
        <Row label="Feasts & fasts of the Church" on={prefs.push.feasts} onChange={setFeasts} />
        <Locked label="Announcements" />

        <Text style={sec}>BY EMAIL</Text>
        <Row label="Daily quest reminder" on={prefs.email.quests} onChange={(v) => setEmail("quests", v)} />
        <Locked label="Announcements" />

        <Text style={{ color: C.muted, fontSize: 11.5, lineHeight: 18, fontFamily: F.body, marginTop: 20 }}>
          Announcements from the brotherhood are always delivered. Phone push activates with the published app; email reminders send once the email provider is connected.
        </Text>
        {!loaded ? null : null}

        {trad === "orthodox" && (
          <>
            <Text style={sec}>CHURCH CALENDAR</Text>
            <View style={{ gap: 8, marginTop: 4 }}>
              {([["new", "New Calendar", "Greek, Antiochian, OCA, Romanian (Nativity Dec 25)"], ["old", "Old Calendar", "Russian, ROCOR, Serbian, Jerusalem, Athos (+13 days)"], ["oriental", "Oriental Orthodox", "Coptic, Armenian, Ethiopian, Syriac (own calendar)"]] as const).map(([val, title, sub]) => (
                <Pressable key={val} onPress={() => pickOrthoCal(val)} style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: orthoCal === val ? C.gold : C.line, backgroundColor: orthoCal === val ? "rgba(201,169,97,0.12)" : "transparent" }}>
                  <Text style={{ color: orthoCal === val ? C.gold : C.ivory, fontFamily: F.bodyMid, fontSize: 14 }}>{orthoCal === val ? "● " : ""}{title}</Text>
                  <Text style={{ color: C.muted, fontFamily: F.body, fontSize: 11.5, marginTop: 2 }}>{sub}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: C.muted, fontSize: 11, lineHeight: 17, fontFamily: F.body, marginTop: 8 }}>Pascha and the moveable feasts are shared by all. This sets the fixed feasts and fasts (Nativity, Dormition, and the rest).</Text>
          </>
        )}

        <Text style={sec}>MEASUREMENTS</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          {(["metric", "imperial"] as const).map((s) => (
            <Pressable key={s} onPress={() => u.setSystem(s)} style={{ flex: 1, paddingVertical: 13, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: u.system === s ? C.gold : C.line, backgroundColor: u.system === s ? C.gold : "transparent" }}>
              <Text style={{ color: u.system === s ? C.black : C.ivory, fontFamily: F.mono, fontSize: 11, letterSpacing: 1 }}>{s === "metric" ? "METRIC" : "IMPERIAL"}</Text>
              <Text style={{ color: u.system === s ? "#1a1408" : C.muted, fontFamily: F.mono, fontSize: 8.5, marginTop: 2 }}>{s === "metric" ? "kg · cm · km" : "lb · in · mi"}</Text>
            </Pressable>
          ))}
        </View>

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
