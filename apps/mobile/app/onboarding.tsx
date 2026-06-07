import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { Seal } from "@/components/Seal";
import { C, F } from "@/lib/theme";

type Faith = "believer" | "seeker" | null;

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

export default function Onboarding() {
  const router = useRouter();
  const { refresh, signOut } = useAuth();
  // 0 intro,1 faith,2 gate,3 fitness,4 equipment,5 goal,6 days,7 class,8 saving
  const [step, setStep] = useState(0);
  const [faith, setFaith] = useState<Faith>(null);
  const [fitness, setFitness] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [days, setDays] = useState(3);
  const [error, setError] = useState("");

  async function finish(finalClass: string) {
    setStep(8); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Session expired. Please sign in again."); return; }
    const { error: e } = await supabase.from("profiles").update({
      believer: faith === "believer" ? "yes" : "seeking",
      faith,
      cls: finalClass,
      char_class: finalClass,
      fitness_level: fitness,
      equipment,
      goals: goal ? [goal] : [],
      days_per_week: days,
      onboarded: true,
    }).eq("user_id", user.id);
    if (e) { setError(e.message); setStep(7); return; }
    await refresh();
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 26, justifyContent: "center" }}>

        {step === 0 && (
          <View style={{ alignItems: "center" }}>
            <Seal size={80} />
            <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 5, fontFamily: F.mono, marginTop: 20 }}>[ THE AWAKENING ]</Text>
            <Text style={{ color: C.ivory, fontSize: 30, fontWeight: "800", fontFamily: F.head, marginTop: 12, textAlign: "center" }}>Before you climb</Text>
            <Text style={{ color: C.muted, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 14, fontFamily: F.body }}>The System must know where you stand. A few questions. Answer honestly. This shapes your path.</Text>
            <Btn label="Begin" onPress={() => setStep(1)} />
          </View>
        )}

        {step === 1 && (
          <View>
            <Step n={1} />
            <Text style={title}>Do you believe in Jesus Christ?</Text>
            <Choice label="Yes. He is Lord." onPress={() => { setFaith("believer"); setStep(3); }} />
            <Choice label="I'm seeking. Open to learn." onPress={() => { setFaith("seeker"); setStep(3); }} />
            <Choice label="No, and I'm not seeking." muted onPress={() => { setFaith(null); setStep(2); }} />
          </View>
        )}

        {step === 2 && (
          <View style={{ alignItems: "center" }}>
            <Seal size={64} />
            <Text style={[title, { textAlign: "center", marginTop: 18 }]}>The door stays open.</Text>
            <Text style={{ color: C.muted, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 10, fontFamily: F.body }}>TABOR is a brotherhood built on Christ. We honor your honesty. If you ever grow curious, you are welcome to walk in and learn. No pressure, no judgment.</Text>
            <Btn label="I'm open to learning" onPress={() => { setFaith("seeker"); setStep(3); }} />
            <Pressable onPress={signOut} style={{ marginTop: 16 }}><Text style={{ color: C.muted, fontSize: 13, fontFamily: F.body }}>Not now — sign out</Text></Pressable>
          </View>
        )}

        {step === 3 && (
          <View>
            <Step n={2} />
            <Text style={title}>Where are you in your training?</Text>
            {FITNESS.map((f) => <Choice key={f.v} label={f.l} sub={f.d} selected={fitness === f.v} onPress={() => { setFitness(f.v); setStep(4); }} />)}
          </View>
        )}

        {step === 4 && (
          <View>
            <Step n={3} />
            <Text style={title}>What can you train with?</Text>
            {EQUIPMENT.map((x) => <Choice key={x.v} label={x.l} sub={x.d} selected={equipment === x.v} onPress={() => { setEquipment(x.v); setStep(5); }} />)}
          </View>
        )}

        {step === 5 && (
          <View>
            <Step n={4} />
            <Text style={title}>What's your main goal?</Text>
            {GOALS.map((x) => <Choice key={x.v} label={x.l} sub={x.d} selected={goal === x.v} onPress={() => { setGoal(x.v); setStep(6); }} />)}
          </View>
        )}

        {step === 6 && (
          <View>
            <Step n={5} />
            <Text style={title}>How many days a week?</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 30, marginVertical: 20 }}>
              <Pressable onPress={() => setDays((d) => Math.max(2, d - 1))}><Text style={{ color: C.gold, fontSize: 40 }}>−</Text></Pressable>
              <Text style={{ color: C.ivory, fontSize: 56, fontFamily: F.head, width: 80, textAlign: "center" }}>{days}</Text>
              <Pressable onPress={() => setDays((d) => Math.min(6, d + 1))}><Text style={{ color: C.gold, fontSize: 40 }}>+</Text></Pressable>
            </View>
            <Btn label="Continue" onPress={() => setStep(7)} />
          </View>
        )}

        {step === 7 && (
          <View>
            <Step n={6} />
            <Text style={title}>Choose your class.</Text>
            <Text style={{ color: C.muted, fontSize: 13, marginBottom: 12, fontFamily: F.body }}>This sets your tone. You can change it later.</Text>
            {CLASSES.map((c) => <Choice key={c.v} label={c.v} sub={c.d} onPress={() => finish(c.v)} />)}
            {!!error && <Text style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{error}</Text>}
          </View>
        )}

        {step === 8 && (
          <View style={{ alignItems: "center" }}>
            <Seal size={72} />
            <ActivityIndicator color={C.gold} style={{ marginTop: 24 }} />
            <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 4, fontFamily: F.mono, marginTop: 18 }}>[ FORGING YOUR PATH ]</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ n }: { n: number }) {
  return <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono, marginBottom: 14 }}>STEP {n} OF 6</Text>;
}
function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={{ marginTop: 26, backgroundColor: C.gold, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 2, alignSelf: "center" }}><Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, letterSpacing: 2 }}>{label.toUpperCase()}</Text></Pressable>;
}
function Choice({ label, sub, onPress, selected, muted }: { label: string; sub?: string; onPress: () => void; selected?: boolean; muted?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ borderWidth: 1, borderColor: selected ? C.gold : C.line, backgroundColor: C.surface2, padding: 16, marginBottom: 10, borderRadius: 2, opacity: muted ? 0.7 : 1 }}>
      <Text style={{ color: C.ivory, fontSize: 16, fontWeight: "600", fontFamily: F.bodyMid }}>{label}</Text>
      {sub && <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, lineHeight: 19, fontFamily: F.body }}>{sub}</Text>}
    </Pressable>
  );
}
const title = { color: C.ivory, fontSize: 23, fontWeight: "800" as const, fontFamily: F.head, marginBottom: 16, lineHeight: 30 };
