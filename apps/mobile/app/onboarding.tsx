import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, TextInput, Switch, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Seal } from "@/components/Seal";
import { useUnits } from "@/lib/units";
import { C, F } from "@/lib/theme";

type Faith = "believer" | "seeker" | null;
const SITE = "https://tabor.quest";
const MIN_AGE = 18;

const FITNESS = [
  { v: "beginner", l: "Beginner", d: "Just starting. I need a foothold." },
  { v: "returning", l: "Returning", d: "Coming back after time away." },
  { v: "consistent", l: "Consistent", d: "I train regularly." },
  { v: "athlete", l: "Athlete", d: "Disciplined and strong." },
];
const EQUIPMENT = [
  { v: "none", l: "Bodyweight only", d: "No equipment. Just me." },
  { v: "dumbbells", l: "Home / dumbbells", d: "Dumbbells, kettlebells, bands." },
  { v: "full", l: "Full gym", d: "Barbells, machines, cables." },
];
const GOALS = [
  { v: "strength", l: "Strength", d: "Lift heavy. Get powerful." },
  { v: "muscle", l: "Build muscle", d: "Size and definition." },
  { v: "fatloss", l: "Fat loss", d: "Lean down, stay conditioned." },
  { v: "endurance", l: "Endurance", d: "Stamina and work capacity." },
];
const CLASSES = [
  { v: "Sentinel", d: "The guardian. Disciplined, steady, holds the line." },
  { v: "Scribe", d: "The student of the Word. Wisdom is your weapon." },
  { v: "Crusader", d: "The front-liner. Bold, relentless, leads the charge." },
  { v: "Pilgrim", d: "The journeyer. Humble, seeking, climbing daily." },
];

const DENOMINATIONS = ["Catholic", "Orthodox", "Anglican", "Baptist", "Methodist", "Lutheran", "Presbyterian", "Pentecostal", "Reformed", "Seventh-day Adventist", "Non-denominational", "Other"];
const FAST_TYPES = [
  { v: "none", l: "Not now" },
  { v: "intermittent", l: "Intermittent (16:8, etc.)" },
  { v: "religious", l: "Follow my church (Lent, fasts)" },
  { v: "custom", l: "Custom" },
] as const;
const FAST_WINDOWS = ["16:8", "18:6", "20:4"];

// step keys in order (gate + underage + saving are special)
type Step = "intro" | "age" | "underage" | "covenant" | "faith" | "faithgate" | "denomination" | "jurisdiction" | "fitness" | "equipment" | "calibration" | "goal" | "days" | "class" | "disciplines" | "saving";

export default function Onboarding() {
  const router = useRouter();
  const { refresh, signOut } = useAuth();
  const u = useUnits();
  const [step, setStep] = useState<Step>("intro");
  const [year, setYear] = useState("");
  const [agree, setAgree] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [faith, setFaith] = useState<Faith>(null);
  const [denomination, setDenomination] = useState<string | null>(null);
  const [orthodoxCalendar, setOrthodoxCalendar] = useState<string | null>(null);
  const [fitness, setFitness] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [days, setDays] = useState(3);
  const [cls, setCls] = useState<string | null>(null);
  // calibration (equipment-specific baseline)
  const [bPush, setBPush] = useState(""); const [bSquat, setBSquat] = useState(""); const [bPull, setBPull] = useState("");
  const [bBenchKg, setBBenchKg] = useState(""); const [bBenchReps, setBBenchReps] = useState("");
  // disciplines
  const [dFuel, setDFuel] = useState(true); const [dSpirit, setDSpirit] = useState(true); const [dDiscipline, setDDiscipline] = useState(false);
  const [fastType, setFastType] = useState<string>("none"); const [fastWindow, setFastWindow] = useState("16:8");
  const [error, setError] = useState("");

  function checkAge() {
    const y = parseInt(year, 10);
    const age = new Date().getUTCFullYear() - y;
    if (!y || y < 1900 || age > 120) { setError("Enter a valid birth year."); return; }
    setError("");
    if (age < MIN_AGE) setStep("underage");
    else setStep("covenant");
  }

  async function finish() {
    setStep("saving"); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Session expired. Please sign in again."); return; }
    const baseline: Record<string, number> = {};
    if (bPush) baseline.pushups = +bPush;
    if (bSquat) baseline.squats = +bSquat;
    if (bPull) baseline.pullups = +bPull;
    if (bBenchKg) baseline.bench_kg = u.dispToKg(+bBenchKg); // input in display units -> store kg
    if (bBenchReps) baseline.bench_reps = +bBenchReps;
    const disciplines: Record<string, unknown> = { fuel: dFuel, spirit: dSpirit, discipline: dDiscipline };
    if (fastType === "intermittent") disciplines.fasting = { type: "intermittent", window: fastWindow };
    else if (fastType === "religious" || fastType === "custom") disciplines.fasting = { type: fastType };
    const { error: e } = await supabase.from("profiles").update({
      believer: faith === "believer" ? "yes" : "seeking",
      faith, denomination, orthodox_calendar: orthodoxCalendar,
      cls, char_class: cls,
      fitness_level: fitness, equipment, goals: goal ? [goal] : [], days_per_week: days,
      dob: year ? `${year}-01-01` : null,
      baseline: Object.keys(baseline).length ? baseline : null,
      disciplines,
      tos_accepted_at: new Date().toISOString(),
      consent: { analytics, marketing },
      onboarded: true,
    }).eq("user_id", user.id);
    if (e) { setError(e.message); setStep("disciplines"); return; }
    await refresh();
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 26, justifyContent: "center" }} keyboardShouldPersistTaps="handled">

        {step === "intro" && (
          <View style={{ alignItems: "center" }}>
            <Seal size={80} />
            <Text style={tag}>[ THE AWAKENING ]</Text>
            <Text style={{ color: C.ivory, fontSize: 30, fontWeight: "800", fontFamily: F.head, marginTop: 12, textAlign: "center" }}>Before you climb</Text>
            <Text style={body}>The System must know where you stand. A few questions. Answer honestly. This shapes your path.</Text>
            <Btn label="Begin" onPress={() => setStep("age")} />
          </View>
        )}

        {step === "age" && (
          <View>
            <Text style={tag}>[ THE GATE ]</Text>
            <Text style={title}>What year were you born?</Text>
            <Text style={body}>TABOR is for ages {MIN_AGE} and up.</Text>
            <TextInput value={year} onChangeText={setYear} placeholder="e.g. 1996" placeholderTextColor={C.muted} keyboardType="number-pad" maxLength={4} style={inp} />
            {!!error && <Text style={errStyle}>{error}</Text>}
            <Btn label="Continue" onPress={checkAge} />
          </View>
        )}

        {step === "underage" && (
          <View style={{ alignItems: "center" }}>
            <Seal size={64} />
            <Text style={[title, { textAlign: "center", marginTop: 18 }]}>Not yet, young one.</Text>
            <Text style={body}>TABOR is built for {MIN_AGE} and older. Keep training, keep seeking. The door will be open when the time comes.</Text>
            <Pressable onPress={signOut} style={{ marginTop: 22 }}><Text style={{ color: C.gold, fontFamily: F.bodyMid }}>Sign out</Text></Pressable>
          </View>
        )}

        {step === "covenant" && (
          <View>
            <Text style={tag}>[ THE COVENANT ]</Text>
            <Text style={title}>Walk in honor.</Text>
            <Text style={body}>TABOR has zero tolerance for hate, harassment, or objectionable content. Treat every brother with respect.</Text>
            <View style={{ flexDirection: "row", gap: 14, marginVertical: 14 }}>
              <Pressable onPress={() => Linking.openURL(`${SITE}/terms`)}><Text style={link}>Terms</Text></Pressable>
              <Pressable onPress={() => Linking.openURL(`${SITE}/privacy`)}><Text style={link}>Privacy</Text></Pressable>
            </View>
            <Pressable onPress={() => setAgree((a) => !a)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
              <View style={{ width: 24, height: 24, borderRadius: 14, borderWidth: 2, borderColor: agree ? C.gold : C.muted, backgroundColor: agree ? C.gold : "transparent", alignItems: "center", justifyContent: "center" }}>{agree ? <Text style={{ color: C.black, fontWeight: "900" }}>✓</Text> : null}</View>
              <Text style={{ color: C.ivory, fontSize: 14, fontFamily: F.body, flex: 1 }}>I agree to the Terms and Community Guidelines.</Text>
            </Pressable>
            <Row label="Allow anonymous analytics" on={analytics} onChange={setAnalytics} />
            <Row label="Email me about drops & news" on={marketing} onChange={setMarketing} />
            <Btn label="Enter" disabled={!agree} onPress={() => agree && setStep("faith")} />
          </View>
        )}

        {step === "faith" && (
          <View>
            <Text style={tag}>[ THE QUESTION ]</Text>
            <Text style={title}>Do you believe in Jesus Christ?</Text>
            <Choice label="Yes. He is Lord." onPress={() => { setFaith("believer"); setStep("denomination"); }} />
            <Choice label="I'm seeking. Open to learn." onPress={() => { setFaith("seeker"); setStep("denomination"); }} />
            <Choice label="No, and I'm not seeking." muted onPress={() => { setFaith(null); setStep("faithgate"); }} />
          </View>
        )}

        {step === "faithgate" && (
          <View style={{ alignItems: "center" }}>
            <Seal size={64} />
            <Text style={[title, { textAlign: "center", marginTop: 18 }]}>The door stays open.</Text>
            <Text style={body}>TABOR is a brotherhood built on Christ. We honor your honesty. If you ever grow curious, you are welcome to walk in and learn.</Text>
            <Btn label="I'm open to learning" onPress={() => { setFaith("seeker"); setStep("denomination"); }} />
            <Pressable onPress={signOut} style={{ marginTop: 16 }}><Text style={{ color: C.muted, fontSize: 13, fontFamily: F.body }}>Not now — sign out</Text></Pressable>
          </View>
        )}

        {step === "denomination" && (
          <View>
            <Text style={tag}>[ YOUR TRADITION ]</Text>
            <Text style={title}>Where do you worship?</Text>
            <Text style={body}>This helps us tailor prayers and lessons. Optional.</Text>
            {DENOMINATIONS.map((d) => <Choice key={d} label={d} selected={denomination === d} onPress={() => { setDenomination(d); setStep(d === "Orthodox" ? "jurisdiction" : "fitness"); }} />)}
            <Pressable onPress={() => { setDenomination(null); setStep("fitness"); }} style={{ marginTop: 6, alignItems: "center" }}><Text style={{ color: C.muted, fontSize: 13, fontFamily: F.body }}>Skip</Text></Pressable>
          </View>
        )}

        {step === "jurisdiction" && (
          <View>
            <Text style={tag}>[ YOUR JURISDICTION ]</Text>
            <Text style={title}>Which calendar do you keep?</Text>
            <Text style={body}>Pascha is shared by all Orthodox. This sets the fixed feasts and fasts so they match your church.</Text>
            <Choice label="New Calendar (Revised Julian)" sub="Greek, Antiochian, OCA, Romanian, Bulgarian" selected={orthodoxCalendar === "new"} onPress={() => { setOrthodoxCalendar("new"); setStep("fitness"); }} />
            <Choice label="Old Calendar (Julian)" sub="Russian, ROCOR, Serbian, Jerusalem, Mount Athos" selected={orthodoxCalendar === "old"} onPress={() => { setOrthodoxCalendar("old"); setStep("fitness"); }} />
            <Choice label="Oriental Orthodox" sub="Coptic, Armenian, Ethiopian, Syriac" selected={orthodoxCalendar === "oriental"} onPress={() => { setOrthodoxCalendar("oriental"); setStep("fitness"); }} />
            <Pressable onPress={() => { setOrthodoxCalendar(null); setStep("fitness"); }} style={{ marginTop: 6, alignItems: "center" }}><Text style={{ color: C.muted, fontSize: 13, fontFamily: F.body }}>Not sure — decide later</Text></Pressable>
          </View>
        )}

        {step === "fitness" && (
          <View>
            <Text style={tag}>[ THE BODY ]</Text>
            <Text style={title}>Where are you in your training?</Text>
            {FITNESS.map((f) => <Choice key={f.v} label={f.l} sub={f.d} selected={fitness === f.v} onPress={() => { setFitness(f.v); setStep("equipment"); }} />)}
          </View>
        )}
        {step === "equipment" && (
          <View>
            <Text style={tag}>[ THE ARMORY ]</Text>
            <Text style={title}>What can you train with?</Text>
            {EQUIPMENT.map((x) => <Choice key={x.v} label={x.l} sub={x.d} selected={equipment === x.v} onPress={() => { setEquipment(x.v); setStep("calibration"); }} />)}
          </View>
        )}
        {step === "calibration" && (
          <View>
            <Text style={tag}>[ CALIBRATION ]</Text>
            <Text style={title}>Set your starting point.</Text>
            <Text style={body}>So your quests match your real strength. Best honest guess. You can skip and calibrate later.</Text>
            {equipment === "full" ? (
              <>
                <Field label={`Bench press — working weight (${u.wUnit})`} value={bBenchKg} onChange={setBBenchKg} />
                <Field label="...for how many reps" value={bBenchReps} onChange={setBBenchReps} />
                <Field label="Max pull-ups in a row (0 if none)" value={bPull} onChange={setBPull} />
              </>
            ) : equipment === "dumbbells" ? (
              <>
                <Field label="Max push-ups in one set" value={bPush} onChange={setBPush} />
                <Field label="Max pull-ups in a row (0 if none)" value={bPull} onChange={setBPull} />
              </>
            ) : (
              <>
                <Field label="Max push-ups in one set" value={bPush} onChange={setBPush} />
                <Field label="Max bodyweight squats in one set" value={bSquat} onChange={setBSquat} />
              </>
            )}
            <Btn label="Continue" onPress={() => setStep("goal")} />
            <Pressable onPress={() => setStep("goal")} style={{ marginTop: 12, alignItems: "center" }}><Text style={{ color: C.muted, fontSize: 13, fontFamily: F.body }}>Skip for now</Text></Pressable>
          </View>
        )}
        {step === "goal" && (
          <View>
            <Text style={tag}>[ THE AIM ]</Text>
            <Text style={title}>What's your main goal?</Text>
            {GOALS.map((x) => <Choice key={x.v} label={x.l} sub={x.d} selected={goal === x.v} onPress={() => { setGoal(x.v); setStep("days"); }} />)}
          </View>
        )}
        {step === "days" && (
          <View>
            <Text style={tag}>[ THE RHYTHM ]</Text>
            <Text style={title}>How many days a week?</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 30, marginVertical: 20 }}>
              <Pressable onPress={() => setDays((d) => Math.max(2, d - 1))}><Text style={{ color: C.gold, fontSize: 40 }}>−</Text></Pressable>
              <Text style={{ color: C.ivory, fontSize: 56, fontFamily: F.head, width: 80, textAlign: "center" }}>{days}</Text>
              <Pressable onPress={() => setDays((d) => Math.min(6, d + 1))}><Text style={{ color: C.gold, fontSize: 40 }}>+</Text></Pressable>
            </View>
            <Btn label="Continue" onPress={() => setStep("class")} />
          </View>
        )}
        {step === "class" && (
          <View>
            <Text style={tag}>[ THE CALLING ]</Text>
            <Text style={title}>Choose your class.</Text>
            <Text style={{ color: C.muted, fontSize: 13, marginBottom: 12, fontFamily: F.body }}>This sets your tone. You can change it later.</Text>
            {CLASSES.map((c) => <Choice key={c.v} label={c.v} sub={c.d} selected={cls === c.v} onPress={() => { setCls(c.v); setStep("disciplines"); }} />)}
          </View>
        )}
        {step === "disciplines" && (
          <View>
            <Text style={tag}>[ YOUR DISCIPLINES ]</Text>
            <Text style={title}>Add disciplines (optional).</Text>
            <Text style={body}>Bonus daily quests beyond your core three. The core always holds your streak. Change these anytime.</Text>
            <Row label="Fuel — water + protein targets" on={dFuel} onChange={setDFuel} />
            <Row label="Spirit — prayer in your tradition + worship" on={dSpirit} onChange={setDSpirit} />
            <Row label="Discipline — steps, mobility, cold, focus" on={dDiscipline} onChange={setDDiscipline} />
            <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 2, fontFamily: F.mono, marginTop: 18, marginBottom: 8 }}>FASTING</Text>
            {FAST_TYPES.map((f) => (
              <Pressable key={f.v} onPress={() => setFastType(f.v)} style={{ borderWidth: 1, borderColor: fastType === f.v ? C.gold : C.line, backgroundColor: C.surface2, padding: 13, marginBottom: 8, borderRadius: 12 }}>
                <Text style={{ color: fastType === f.v ? C.gold : C.ivory, fontSize: 15, fontFamily: F.bodyMid }}>{f.l}</Text>
              </Pressable>
            ))}
            {fastType === "intermittent" && (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 2 }}>
                {FAST_WINDOWS.map((w) => <Pressable key={w} onPress={() => setFastWindow(w)} style={{ flex: 1, borderWidth: 1, borderColor: fastWindow === w ? C.gold : C.line, paddingVertical: 10, alignItems: "center", borderRadius: 12 }}><Text style={{ color: fastWindow === w ? C.gold : C.muted, fontFamily: F.mono, fontSize: 13 }}>{w}</Text></Pressable>)}
              </View>
            )}
            <Btn label="Begin the climb" onPress={finish} />
            {!!error && <Text style={errStyle}>{error}</Text>}
          </View>
        )}
        {step === "saving" && (
          <View style={{ alignItems: "center" }}>
            <Seal size={72} />
            <ActivityIndicator color={C.gold} style={{ marginTop: 24 }} />
            <Text style={tag}>[ FORGING YOUR PATH ]</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function Btn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled} style={{ marginTop: 26, backgroundColor: C.gold, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12, alignSelf: "center", opacity: disabled ? 0.4 : 1 }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, letterSpacing: 2 }}>{label.toUpperCase()}</Text></Pressable>;
}
function Choice({ label, sub, onPress, selected, muted }: { label: string; sub?: string; onPress: () => void; selected?: boolean; muted?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ borderWidth: 1, borderColor: selected ? C.gold : C.line, backgroundColor: C.surface2, padding: 16, marginBottom: 10, borderRadius: 12, opacity: muted ? 0.7 : 1 }}>
      <Text style={{ color: C.ivory, fontSize: 16, fontWeight: "600", fontFamily: F.bodyMid }}>{label}</Text>
      {sub && <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, lineHeight: 19, fontFamily: F.body }}>{sub}</Text>}
    </Pressable>
  );
}
function Row({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 }}>
      <Text style={{ color: C.text, fontSize: 14, fontFamily: F.body, flex: 1 }}>{label}</Text>
      <Switch value={on} onValueChange={onChange} trackColor={{ false: C.surface, true: C.gold }} thumbColor={C.ivory} />
    </View>
  );
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: C.muted, fontSize: 13, fontFamily: F.body, marginBottom: 6 }}>{label}</Text>
      <TextInput value={value} onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))} keyboardType="number-pad" placeholder="0" placeholderTextColor={C.muted} style={inp} />
    </View>
  );
}
const tag = { color: C.gold, fontSize: 11, letterSpacing: 4, fontFamily: F.mono, marginBottom: 12, marginTop: 8 } as const;
const title = { color: C.ivory, fontSize: 23, fontWeight: "800" as const, fontFamily: F.head, marginBottom: 12, lineHeight: 30 };
const body = { color: C.muted, fontSize: 15, lineHeight: 23, fontFamily: F.body, marginBottom: 4 } as const;
const link = { color: C.gold, fontSize: 14, fontFamily: F.bodyMid, textDecorationLine: "underline" } as const;
const inp = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 13, fontSize: 18, marginTop: 12, borderRadius: 12, fontFamily: F.body } as const;
const errStyle = { color: C.red, fontSize: 13, marginTop: 10, fontFamily: F.body } as const;
