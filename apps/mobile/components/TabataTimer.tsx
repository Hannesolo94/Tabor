import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Vibration, Modal, TextInput } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { getTabataPresets, saveTabataPreset, deleteTabataPreset, getRoutines, getRoutineExercises, DEFAULT_TABATA, type TabataConfig, type TabataPreset, type Routine } from "@/lib/fitness";
import { useActionSheet } from "@/components/ActionSheet";
import { C, F } from "@/lib/theme";

type SegType = "prepare" | "work" | "rest" | "restSet" | "cooldown";
interface Seg { type: SegType; dur: number; cycle?: number; set?: number }

const META: Record<SegType, { label: string; color: string }> = {
  prepare: { label: "GET READY", color: "#c9a961" },
  work: { label: "WORK", color: C.gold },
  rest: { label: "REST", color: "#6fa8dc" },
  restSet: { label: "SET BREAK", color: "#8e7cc3" },
  cooldown: { label: "COOLDOWN", color: C.green },
};

function buildSeq(c: TabataConfig): Seg[] {
  const seq: Seg[] = [];
  if (c.prepare > 0) seq.push({ type: "prepare", dur: c.prepare });
  for (let s = 1; s <= c.sets; s++) {
    for (let cy = 1; cy <= c.cycles; cy++) {
      seq.push({ type: "work", dur: c.work, cycle: cy, set: s });
      const last = s === c.sets && cy === c.cycles;
      if (c.rest > 0 && !last) seq.push({ type: "rest", dur: c.rest, cycle: cy, set: s });
    }
    if (s < c.sets && c.restBetween > 0) seq.push({ type: "restSet", dur: c.restBetween, set: s });
  }
  if (c.cooldown > 0) seq.push({ type: "cooldown", dur: c.cooldown });
  return seq;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

export function TabataTimer({ userId, onComplete }: { userId?: string; onComplete: () => void }) {
  const [cfg, setCfg] = useState<TabataConfig>(DEFAULT_TABATA);
  const [moves, setMoves] = useState<string[]>([]);
  const [moveInput, setMoveInput] = useState("");
  const [presets, setPresets] = useState<TabataPreset[]>([]);
  const [routineModal, setRoutineModal] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const seq = useMemo(() => buildSeq(cfg), [cfg]);
  const totalDur = useMemo(() => seq.reduce((a, s) => a + s.dur, 0), [seq]);
  const sheet = useActionSheet();

  const [idx, setIdx] = useState(-1);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const posRef = useRef({ idx: -1, left: 0 }); // source of truth while running
  const lastRef = useRef(0);                   // wall-clock anchor of the last applied second

  const loadPresets = () => { if (userId) getTabataPresets(userId).then(setPresets); };
  useEffect(() => { loadPresets(); /* eslint-disable-next-line */ }, [userId]);

  const cur = idx >= 0 && idx < seq.length ? seq[idx] : null;
  const done = idx >= seq.length && seq.length > 0 && idx !== -1;
  const elapsedBefore = useMemo(() => { let t = 0; for (let i = 0; i < idx; i++) t += seq[i]?.dur ?? 0; return t; }, [idx, seq]);
  const totalLeft = cur ? totalDur - elapsedBefore - (cur.dur - left) : done ? 0 : totalDur;
  const moveOf = (cycle?: number) => (moves.length && cycle ? moves[(cycle - 1) % moves.length] : null);

  // Wall-clock driven: each tick advances by the REAL seconds elapsed since the last
  // applied second (cascading across segments), so a backgrounded/locked phone catches
  // up correctly on resume instead of freezing or drifting.
  useEffect(() => {
    if (!running) { if (tick.current) clearInterval(tick.current); return; }
    lastRef.current = Date.now();
    tick.current = setInterval(() => {
      const now = Date.now();
      let dt = Math.floor((now - lastRef.current) / 1000);
      if (dt < 1) return;
      lastRef.current += dt * 1000;
      let { idx: i, left: l } = posRef.current;
      while (dt > 0) {
        if (l > dt) { l -= dt; dt = 0; }
        else {
          dt -= l;
          const next = i + 1;
          if (next >= seq.length) {
            posRef.current = { idx: next, left: 0 }; setIdx(next); setLeft(0);
            setRunning(false); onComplete(); Vibration.vibrate([0, 250, 120, 250]);
            return;
          }
          i = next; l = seq[next].dur;
          Vibration.vibrate(seq[next].type === "work" ? 350 : 200);
        }
      }
      posRef.current = { idx: i, left: l };
      setIdx(i); setLeft(l);
      if (l > 0 && l <= 4) Vibration.vibrate(55);
    }, 250);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [running, seq, onComplete]);

  const seek = (i: number, l: number) => { posRef.current = { idx: i, left: l }; lastRef.current = Date.now(); setIdx(i); setLeft(l); };
  function start() { if (!seq.length) return; seek(0, seq[0].dur); setRunning(true); Vibration.vibrate(300); }
  function reset() { setRunning(false); seek(-1, 0); }
  function skip() { const n = idx + 1; if (n >= seq.length) { setRunning(false); seek(n, 0); onComplete(); } else seek(n, seq[n].dur); }
  function back() { const p = Math.max(0, idx - 1); seek(p, seq[p].dur); }
  function set<K extends keyof TabataConfig>(k: K, v: number) { setCfg((c) => ({ ...c, [k]: Math.max(0, v) })); }
  async function savePreset() {
    if (!userId) return;
    const base = moves.length ? `${moves.length} moves` : `${cfg.work}/${cfg.rest}×${cfg.cycles}`;
    await saveTabataPreset(userId, base + (cfg.sets > 1 ? ` ·${cfg.sets} sets` : ""), cfg, moves); loadPresets();
  }
  async function openRoutines() { if (userId) setRoutines(await getRoutines(userId)); setRoutineModal(true); }
  async function loadRoutine(r: Routine) {
    const ex = await getRoutineExercises(r.id);
    const names = ex.map((e) => e.exercise?.name ?? "Move").filter(Boolean);
    setMoves(names);
    if (names.length) setCfg((c) => ({ ...c, cycles: names.length }));
    setRoutineModal(false);
  }
  function addMove() { const m = moveInput.trim(); if (!m) return; const next = [...moves, m]; setMoves(next); setMoveInput(""); setCfg((c) => ({ ...c, cycles: Math.max(c.cycles, next.length) })); }

  // ---- config screen ----
  if (idx === -1) {
    return (
      <>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
          <Stepper label="PREPARE (s)" value={cfg.prepare} set={(v) => set("prepare", v)} step={5} />
          <Stepper label="WORK (s)" value={cfg.work} set={(v) => set("work", v)} step={5} min={5} />
          <Stepper label="REST (s)" value={cfg.rest} set={(v) => set("rest", v)} step={5} />
          <Stepper label="CYCLES (per set)" value={cfg.cycles} set={(v) => set("cycles", v)} step={1} min={1} />
          <Stepper label="SETS" value={cfg.sets} set={(v) => set("sets", v)} step={1} min={1} />
          {cfg.sets > 1 && <Stepper label="SET BREAK (s)" value={cfg.restBetween} set={(v) => set("restBetween", v)} step={15} />}
          <Stepper label="COOLDOWN (s)" value={cfg.cooldown} set={(v) => set("cooldown", v)} step={15} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
            <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono }}>TOTAL TIME</Text>
            <Text style={{ color: C.gold, fontSize: 13, fontFamily: F.head }}>{fmt(totalDur)} · {cfg.cycles * cfg.sets} rounds</Text>
          </View>

          {/* moves: pure timer / load routine / build own */}
          <View style={{ marginTop: 18, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono }}>MOVES · OPTIONAL</Text>
              <Pressable onPress={openRoutines} hitSlop={6}><Text style={{ color: C.gold, fontSize: 10, fontFamily: F.mono }}>＋ LOAD ROUTINE</Text></Pressable>
            </View>
            {moves.length === 0 ? (
              <Text style={{ color: C.muted, fontSize: 11, fontFamily: F.body, marginTop: 6 }}>Pure timer. Add moves below or load a routine to be told what to do each work interval.</Text>
            ) : (
              <View style={{ marginTop: 8, gap: 5 }}>
                {moves.map((mv, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, width: 22 }}>{i + 1}</Text>
                    <Text style={{ color: C.ivory, fontSize: 13, flex: 1 }} numberOfLines={1}>{mv}</Text>
                    <Pressable onPress={() => setMoves((x) => x.filter((_, k) => k !== i))} hitSlop={8}><Text style={{ color: C.red, fontSize: 16 }}>×</Text></Pressable>
                  </View>
                ))}
              </View>
            )}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <TextInput value={moveInput} onChangeText={setMoveInput} onSubmitEditing={addMove} placeholder="Add a move (e.g. Burpees)" placeholderTextColor={C.muted} style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, fontSize: 13 }} />
              <Pressable onPress={addMove} style={{ borderWidth: 1, borderColor: C.gold, paddingHorizontal: 14, justifyContent: "center", borderRadius: 12 }}><Text style={{ color: C.gold, fontFamily: F.head }}>ADD</Text></Pressable>
            </View>
            {moves.length > 0 && <Pressable onPress={() => setMoves([])} style={{ marginTop: 6 }}><Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono }}>CLEAR · PURE TIMER</Text></Pressable>}
          </View>

          {presets.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {presets.map((p) => (
                <Pressable key={p.id} onPress={() => { setCfg(p.config); setMoves(p.moves); }} onLongPress={() => sheet({ title: "Delete preset?", message: p.name, actions: [{ label: "Delete", style: "destructive", onPress: async () => { await deleteTabataPreset(p.id); loadPresets(); } }] })} delayLongPress={350} style={{ borderWidth: 1, borderColor: C.line, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 12 }}>
                  <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono }}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {userId && <Pressable onPress={savePreset} style={{ marginTop: 14, alignItems: "center" }}><Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body }}>Save current as a timer routine</Text></Pressable>}

          <Pressable onPress={start} style={{ backgroundColor: C.gold, paddingVertical: 15, alignItems: "center", borderRadius: 12, marginTop: 18 }}>
            <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>START</Text>
          </Pressable>
        </ScrollView>

        <Modal visible={routineModal} transparent animationType="slide" onRequestClose={() => setRoutineModal(false)}>
          <Pressable onPress={() => setRoutineModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
            <Pressable onPress={() => {}} style={{ backgroundColor: C.surface, borderTopWidth: 1, borderColor: C.gold, padding: 18, maxHeight: "70%" }}>
              <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginBottom: 10 }}>LOAD A ROUTINE'S EXERCISES AS MOVES</Text>
              <ScrollView>
                {routines.length === 0 && <Text style={{ color: C.muted, fontFamily: F.body }}>No routines yet. Build one in the Program tab.</Text>}
                {routines.map((r) => (
                  <Pressable key={r.id} onPress={() => loadRoutine(r)} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }}>
                    <Text style={{ color: C.ivory, fontSize: 15 }}>{r.name}</Text>
                    <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono }}>{r.generated ? "GENERATED" : "CUSTOM"}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  }

  // ---- running / done screen ----
  const m = cur ? META[cur.type] : META.cooldown;
  const color = done ? C.green : m.color;
  const pct = cur ? left / cur.dur : 1;
  const R = 96, CIRC = 2 * Math.PI * R;
  const nowMove = cur?.type === "work" ? moveOf(cur.cycle) : null;
  const nextMove = cur?.type === "rest" ? moveOf((cur.cycle ?? 0) + 1) : null;

  return (
    <View style={{ alignItems: "center", paddingTop: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 8 }}>
        <Text style={lbl}>TOTAL LEFT  {fmt(totalLeft)}</Text>
        {cur?.set && cfg.sets > 1 ? <Text style={lbl}>SET {cur.set}/{cfg.sets}</Text> : <Text style={lbl}> </Text>}
      </View>

      <View style={{ width: 220, height: 220, alignItems: "center", justifyContent: "center", marginVertical: 6 }}>
        <Svg width={220} height={220} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
          <Circle cx={110} cy={110} r={R} stroke={C.line} strokeWidth={8} fill="none" />
          <Circle cx={110} cy={110} r={R} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)} />
        </Svg>
        <Text style={{ color, fontSize: 12, letterSpacing: 4, fontFamily: F.mono }}>{done ? "COMPLETE" : m.label}</Text>
        <Text style={{ color: C.ivory, fontSize: 66, fontFamily: F.head, lineHeight: 74 }}>{done ? "✓" : left}</Text>
        {cur?.cycle ? <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.mono }}>CYCLE {cur.cycle}/{cfg.cycles}</Text> : <Text style={{ color: C.muted, fontSize: 12 }}> </Text>}
      </View>

      {nowMove ? <Text style={{ color: C.gold, fontSize: 20, fontFamily: F.head, textAlign: "center", marginTop: 2 }} numberOfLines={1}>{nowMove}</Text> : null}
      {nextMove ? <Text style={{ color: C.muted, fontSize: 12, fontFamily: F.mono, marginTop: 4 }}>NEXT: {nextMove}</Text> : null}

      {done ? (
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
          <Pressable onPress={start} style={{ backgroundColor: C.gold, paddingVertical: 14, paddingHorizontal: 34, borderRadius: 12 }}><Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>GO AGAIN</Text></Pressable>
          <Pressable onPress={reset} style={{ borderWidth: 1, borderColor: C.line, paddingVertical: 14, paddingHorizontal: 26, borderRadius: 12 }}><Text style={{ color: C.muted, fontFamily: F.headMid, letterSpacing: 1 }}>EDIT</Text></Pressable>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <Pressable onPress={back} style={ctrl}><Text style={ctrlT}>⏮</Text></Pressable>
            <Pressable onPress={() => setRunning((r) => !r)} style={[ctrl, { paddingHorizontal: 34, borderColor: C.gold }]}><Text style={[ctrlT, { color: C.gold }]}>{running ? "PAUSE" : "RESUME"}</Text></Pressable>
            <Pressable onPress={skip} style={ctrl}><Text style={ctrlT}>⏭</Text></Pressable>
          </View>
          <Pressable onPress={reset} style={{ marginTop: 14 }}><Text style={{ color: C.muted, fontSize: 11, fontFamily: F.mono, letterSpacing: 1 }}>RESET</Text></Pressable>
        </>
      )}
    </View>
  );
}

function Stepper({ label, value, set, step, min = 0 }: { label: string; value: number; set: (n: number) => void; step: number; min?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
      <Text style={{ color: C.muted, fontSize: 12, letterSpacing: 1, fontFamily: F.mono }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Pressable onPress={() => set(Math.max(min, value - step))} hitSlop={10}><Text style={{ color: C.gold, fontSize: 26 }}>−</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head, width: 42, textAlign: "center" }}>{value}</Text>
        <Pressable onPress={() => set(value + step)} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>+</Text></Pressable>
      </View>
    </View>
  );
}

const lbl = { color: C.muted, fontSize: 10, fontFamily: F.mono, letterSpacing: 1 } as const;
const ctrl = { borderWidth: 1, borderColor: C.line, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, minWidth: 56, alignItems: "center" as const };
const ctrlT = { color: C.muted, fontFamily: F.headMid, letterSpacing: 1, fontSize: 14 } as const;
