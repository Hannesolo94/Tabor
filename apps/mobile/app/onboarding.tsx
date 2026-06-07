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

const CLASSES = [
  { v: "Sentinel", d: "The guardian. Disciplined, steady, holds the line." },
  { v: "Scribe", d: "The student of the Word. Wisdom is your weapon." },
  { v: "Crusader", d: "The front-liner. Bold, relentless, leads the charge." },
  { v: "Pilgrim", d: "The journeyer. Humble, seeking, climbing daily." },
];

export default function Onboarding() {
  const router = useRouter();
  const { refresh, signOut } = useAuth();
  const [step, setStep] = useState(0); // 0 intro, 1 faith, 2 gate, 3 fitness, 4 class, 5 saving
  const [faith, setFaith] = useState<Faith>(null);
  const [fitness, setFitness] = useState<string | null>(null);
  const [cls, setCls] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function finish(finalClass: string) {
    setStep(5); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Session expired. Please sign in again."); return; }
    const { error: e } = await supabase.from("profiles").update({
      believer: faith === "believer" ? "yes" : "seeking",  // constrained: yes|seeking|no
      faith,                                                 // text record (believer | seeker)
      cls: finalClass,                                       // constrained: Sentinel|Scribe|Crusader|Pilgrim
      char_class: finalClass,
      fitness_level: fitness,
      onboarded: true,
    }).eq("user_id", user.id);
    if (e) { setError(e.message); setStep(4); return; }
    await refresh();
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 26, justifyContent: "center" }}>

        {step === 0 && (
          <View style={{ alignItems: "center" }}>
            <Seal size={80} />
            <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 5, marginTop: 20 }}>[ THE AWAKENING ]</Text>
            <Text style={{ color: C.ivory, fontSize: 30, fontWeight: "800", fontFamily: F.head, marginTop: 12, textAlign: "center" }}>Before you climb</Text>
            <Text style={{ color: C.muted, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 14 }}>
              The System must know where you stand. A few questions. Answer honestly. This shapes your path.
            </Text>
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
            <Text style={{ color: C.muted, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 10 }}>
              TABOR is a brotherhood built on Christ. We honor your honesty. If you ever grow curious, you are welcome to walk in and learn. No pressure, no judgment.
            </Text>
            <Btn label="I'm open to learning" onPress={() => { setFaith("seeker"); setStep(3); }} />
            <Pressable onPress={signOut} style={{ marginTop: 16 }}>
              <Text style={{ color: C.muted, fontSize: 13 }}>Not now — sign out</Text>
            </Pressable>
          </View>
        )}

        {step === 3 && (
          <View>
            <Step n={2} />
            <Text style={title}>Where are you in your training?</Text>
            {FITNESS.map((f) => (
              <Choice key={f.v} label={f.l} sub={f.d} selected={fitness === f.v} onPress={() => { setFitness(f.v); setStep(4); }} />
            ))}
          </View>
        )}

        {step === 4 && (
          <View>
            <Step n={3} />
            <Text style={title}>Choose your class.</Text>
            <Text style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>This sets your tone. You can change it later.</Text>
            {CLASSES.map((c) => (
              <Choice key={c.v} label={c.v} sub={c.d} selected={cls === c.v} onPress={() => { setCls(c.v); finish(c.v); }} />
            ))}
            {!!error && <Text style={{ color: C.red, fontSize: 13, marginTop: 10 }}>{error}</Text>}
          </View>
        )}

        {step === 5 && (
          <View style={{ alignItems: "center" }}>
            <Seal size={72} />
            <ActivityIndicator color={C.gold} style={{ marginTop: 24 }} />
            <Text style={{ color: C.gold, fontSize: 12, letterSpacing: 4, marginTop: 18 }}>[ FORGING YOUR PATH ]</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ n }: { n: number }) {
  return <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, marginBottom: 14 }}>STEP {n} OF 3</Text>;
}

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginTop: 26, backgroundColor: C.gold, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 2 }}>
      <Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, letterSpacing: 2 }}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

function Choice({ label, sub, onPress, selected, muted }: { label: string; sub?: string; onPress: () => void; selected?: boolean; muted?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ borderWidth: 1, borderColor: selected ? C.gold : C.line, backgroundColor: C.surface2, padding: 16, marginBottom: 10, borderRadius: 2, opacity: muted ? 0.7 : 1 }}>
      <Text style={{ color: C.ivory, fontSize: 16, fontWeight: "600" }}>{label}</Text>
      {sub && <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, lineHeight: 19 }}>{sub}</Text>}
    </Pressable>
  );
}

const title = { color: C.ivory, fontSize: 23, fontWeight: "800" as const, fontFamily: F.head, marginBottom: 16, lineHeight: 30 };
