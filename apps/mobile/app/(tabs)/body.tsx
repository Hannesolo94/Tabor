import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { todayKey } from "@/lib/quests";
import { C, F } from "@/lib/theme";
import { useTabBar } from "@/lib/tabbar";

const ROUTINES = [
  { name: "Sentinel Strength", tag: "STRENGTH", moves: ["Push-ups x20", "Squats x30", "Plank 60s", "Lunges x20", "Burpees x10"] },
  { name: "Crusader Conditioning", tag: "HIIT", moves: ["Jumping jacks 40s", "Mountain climbers 40s", "High knees 40s", "Rest 20s", "Repeat x4"] },
  { name: "Pilgrim Mobility", tag: "RECOVERY", moves: ["Hip openers", "Cat-cow x10", "World's greatest stretch", "Deep squat hold 60s"] },
];

type Phase = "idle" | "work" | "rest" | "done";

export default function Body() {
  const tb = useTabBar();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [tab, setTab] = useState<"tabata" | "routines">("tabata");
  const [count, setCount] = useState(0);

  async function refreshCount() {
    if (!userId) return;
    const { count: n } = await supabase.from("workouts").select("id", { count: "exact", head: true }).eq("user_id", userId);
    setCount(n ?? 0);
  }
  useEffect(() => { refreshCount(); /* eslint-disable-next-line */ }, [userId]);

  async function logWorkout(name = "Workout", mins = 15) {
    if (!userId) return;
    await supabase.from("workouts").insert({ user_id: userId, name, mins, day: todayKey() });
    refreshCount();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView onScroll={tb?.onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono }}>[ FITNESS GUILD ]</Text>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", fontFamily: F.head, marginTop: 6 }}>The Body</Text>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{count} workout{count === 1 ? "" : "s"} logged</Text>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 18 }}>
          {(["tabata", "routines"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ paddingVertical: 7, paddingHorizontal: 14, borderWidth: 1, borderColor: tab === t ? C.gold : C.line, backgroundColor: tab === t ? C.gold : "transparent", borderRadius: 2 }}>
              <Text style={{ color: tab === t ? C.black : C.muted, fontSize: 10, letterSpacing: 1, fontWeight: "700" }}>{t === "tabata" ? "TABATA TIMER" : "ROUTINES"}</Text>
            </Pressable>
          ))}
        </View>

        {tab === "tabata" ? <Tabata onComplete={() => logWorkout("Tabata Session", 4)} /> : (
          <View>
            {ROUTINES.map((r) => (
              <View key={r.name} style={{ borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, padding: 16, marginBottom: 12, borderRadius: 2 }}>
                <Text style={{ color: C.gold, fontSize: 9, letterSpacing: 2 }}>{r.tag}</Text>
                <Text style={{ color: C.ivory, fontSize: 17, fontWeight: "700", marginTop: 3, marginBottom: 8 }}>{r.name}</Text>
                {r.moves.map((m) => <Text key={m} style={{ color: C.text, fontSize: 14, lineHeight: 24 }}>• {m}</Text>)}
                <Pressable onPress={() => logWorkout(r.name, 15)} style={{ marginTop: 12, borderWidth: 1, borderColor: C.gold, paddingVertical: 10, alignItems: "center", borderRadius: 2 }}>
                  <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 2 }}>MARK COMPLETE</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Tabata({ onComplete }: { onComplete: () => void }) {
  const [work, setWork] = useState(20);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(1);
  const [left, setLeft] = useState(20);
  const [running, setRunning] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return; }
    timer.current = setInterval(() => {
      setLeft((l) => {
        if (l > 1) return l - 1;
        // phase transition
        setPhase((p) => {
          if (p === "work") { setLeft(rest); return "rest"; }
          // rest finished
          setRound((r) => {
            if (r >= rounds) { setRunning(false); setPhase("done"); onComplete(); return r; }
            setLeft(work); setPhase("work"); return r + 1;
          });
          return p;
        });
        return l;
      });
    }, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [running, work, rest, rounds, onComplete]);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
    ])).start();
  }, [pulse]);

  const start = () => { setPhase("work"); setRound(1); setLeft(work); setRunning(true); };
  const reset = () => { setRunning(false); setPhase("idle"); setRound(1); setLeft(work); };

  const color = phase === "work" ? C.gold : phase === "rest" ? "#6fa8dc" : phase === "done" ? C.green : C.muted;

  return (
    <View style={{ alignItems: "center" }}>
      {phase === "idle" && (
        <View style={{ width: "100%", marginBottom: 22 }}>
          <Stepper label="WORK (s)" value={work} set={setWork} step={5} min={5} />
          <Stepper label="REST (s)" value={rest} set={setRest} step={5} min={5} />
          <Stepper label="ROUNDS" value={rounds} set={setRounds} step={1} min={1} />
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: running ? pulse : 1 }], width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: color, alignItems: "center", justifyContent: "center", marginVertical: 10 }}>
        <Text style={{ color, fontSize: 12, letterSpacing: 4, fontFamily: F.mono }}>{phase === "done" ? "COMPLETE" : phase.toUpperCase()}</Text>
        <Text style={{ color: C.ivory, fontSize: 64, fontWeight: "800", fontFamily: F.head }}>{phase === "done" ? "✓" : left}</Text>
        {phase !== "idle" && phase !== "done" && <Text style={{ color: C.muted, fontSize: 12, letterSpacing: 2 }}>ROUND {round}/{rounds}</Text>}
      </Animated.View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
        {phase === "idle" || phase === "done" ? (
          <Pressable onPress={start} style={{ backgroundColor: C.gold, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 2 }}>
            <Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, letterSpacing: 2 }}>{phase === "done" ? "GO AGAIN" : "START"}</Text>
          </Pressable>
        ) : (
          <>
            <Pressable onPress={() => setRunning((r) => !r)} style={{ borderWidth: 1, borderColor: C.gold, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 2 }}>
              <Text style={{ color: C.gold, fontWeight: "700", letterSpacing: 2 }}>{running ? "PAUSE" : "RESUME"}</Text>
            </Pressable>
            <Pressable onPress={reset} style={{ borderWidth: 1, borderColor: C.line, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 2 }}>
              <Text style={{ color: C.muted, fontWeight: "700", letterSpacing: 2 }}>RESET</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

function Stepper({ label, value, set, step, min }: { label: string; value: number; set: (n: number) => void; step: number; min: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
      <Text style={{ color: C.muted, fontSize: 12, letterSpacing: 2 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <Pressable onPress={() => set(Math.max(min, value - step))} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>−</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontWeight: "700", width: 40, textAlign: "center" }}>{value}</Text>
        <Pressable onPress={() => set(value + step)} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>+</Text></Pressable>
      </View>
    </View>
  );
}
