// proto-body.jsx — Fitness Guild: routines, workout player, Tabata builder/presets, history/PRs
const { useState: useBS, useEffect: useBE, useRef: useBR } = React;

const ROUTINES = [
  { id: "foundation", name: "Foundation", tier: "Recruit", minIdx: 0, mins: 15, focus: "Bodyweight base",
    ex: [["Air Squats", "3 x 15"], ["Push-ups", "3 x 10"], ["Forward Lunges", "3 x 12"], ["Plank", "3 x 30s"]] },
  { id: "forge", name: "The Forge", tier: "Tempered", minIdx: 2, mins: 25, focus: "Strength circuit",
    ex: [["Push-ups", "4 x 15"], ["Pull-ups", "4 x 6"], ["Goblet Squat", "4 x 12"], ["KB Swing", "4 x 20"], ["Hollow Hold", "4 x 30s"]] },
  { id: "crucible", name: "Crucible", tier: "Crucible", minIdx: 4, mins: 35, focus: "Conditioning grind",
    ex: [["Burpees", "5 x 12"], ["Weighted Pull-ups", "5 x 5"], ["Front Squat", "5 x 8"], ["Box Jumps", "5 x 10"], ["Ab Wheel", "5 x 10"]] },
  { id: "dawn", name: "Dawn Mobility", tier: "All", minIdx: 0, mins: 10, focus: "Recovery + mobility",
    ex: [["World's Greatest", "2 x 8"], ["Cat-Cow", "2 x 10"], ["Hip Opener", "2 x 8"], ["Thoracic Rotation", "2 x 10"]] },
];
function tierColor(idx, userIdx) { return userIdx >= idx ? "var(--holy-gold)" : "#6E6A60"; }
const backB = { background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: 14 };

function BodyScreen({ s, actions, go, rankIdx = 3 }) {
  const q = s.quests.find(x => x.id === "iron");
  const recId = s.equipment === "Bodyweight only" ? "foundation" : ({ Beginner: "foundation", Intermediate: "forge", Advanced: "crucible" }[s.fitnessLevel] || "forge");
  const [view, setView] = useBS("hub");
  const [routine, setRoutine] = useBS(null);
  const [tabata, setTabata] = useBS(null);

  if (view === "routine" && routine) return <RoutineDetail r={routine} onBack={() => setView("hub")} onPlay={() => setView("player")} onComplete={() => { actions.completeQuest("iron"); actions.logWorkout(routine.name, routine.mins); setView("hub"); }} done={q.done} />;
  if (view === "player" && routine) return <WorkoutPlayer r={routine} onBack={() => setView("routine")} onDone={() => { actions.completeQuest("iron"); actions.logWorkout(routine.name, routine.mins); setView("hub"); }} />;
  if (view === "tabata") return <TabataBuilder s={s} actions={actions} onBack={() => setView("hub")} onStart={(cfg) => { setTabata(cfg); setView("timer"); }} />;
  if (view === "timer" && tabata) return <TabataTimer cfg={tabata} onBack={() => setView("tabata")} onDone={() => { actions.completeQuest("iron"); actions.logWorkout("Tabata", Math.round((tabata.work + tabata.rest) * tabata.rounds / 60)); setView("hub"); }} />;
  if (view === "history") return <BodyHistory s={s} onBack={() => setView("hub")} />;

  return (
    <Screen>
      <ScreenTop kicker="[ FITNESS GUILD ]" title="Iron" right={<Seal size={40} id="bd-seal" />} />
      <SystemLine>{q.done ? "Iron logged. The body is tempered." : `The body is a temple. Train it, ${s.cls}.`}</SystemLine>
      {!q.done && (
        <div style={{ border: "1px solid rgba(201,169,97,0.3)", background: "rgba(20,20,26,0.5)", padding: "14px", margin: "16px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.16em" }}>TODAY'S STEPS</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--holy-gold)" }}>{s.ironSteps.toLocaleString()} / {s.ironGoal.toLocaleString()}</span>
          </div>
          <div style={{ height: 8, background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.35)", position: "relative" }}><div style={{ position: "absolute", inset: 0, width: `${Math.min(100, s.ironSteps / s.ironGoal * 100)}%`, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)", transition: "width .4s" }} /></div>
          <div style={{ marginTop: 10 }}>{s.ironSteps >= s.ironGoal ? <GoldBtn onClick={() => actions.completeQuest("iron")}>Claim · Iron Body</GoldBtn> : <GhostBtn onClick={() => actions.addSteps(2500)}>+ 2,500 steps (demo)</GhostBtn>}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, margin: "16px 0 20px" }}>
        <button onClick={() => setView("tabata")} style={{ flex: 1, cursor: "pointer", background: "linear-gradient(180deg, rgba(201,169,97,0.16), rgba(201,169,97,0.04))", border: "1px solid rgba(201,169,97,0.45)", padding: "14px 12px", textAlign: "left" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--holy-gold)" }}>⏱</span>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)", marginTop: 4 }}>Forge Your Own</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#9A948A" }}>Tabata builder</div>
        </button>
        <button onClick={() => setView("history")} style={{ flex: 1, cursor: "pointer", background: "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.3)", padding: "14px 12px", textAlign: "left" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--holy-gold)" }}>▤</span>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)", marginTop: 4 }}>History & PRs</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#9A948A" }}>{s.workoutsLogged} logged</div>
        </button>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 12 }}>ROUTINES FOR YOUR RANK</div>
      {ROUTINES.map(r => {
        const rec = rankIdx >= r.minIdx;
        return (
          <button key={r.id} onClick={() => { setRoutine(r); setView("routine"); }} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", cursor: "pointer", background: "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.22)", padding: "15px 16px", marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--holy-ivory)" }}>{r.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.12em", color: tierColor(r.minIdx, rankIdx), border: `1px solid ${rec ? "rgba(201,169,97,0.4)" : "rgba(110,106,96,0.4)"}`, padding: "2px 6px" }}>{rec ? "READY" : r.tier.toUpperCase()}</span>
                {recId === r.id && <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", color: "#0A0A0A", background: "var(--holy-gold)", padding: "2px 6px" }}>FOR YOU</span>}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A", marginTop: 3 }}>{r.focus} · {r.mins} min · {r.ex.length} movements</div>
            </div>
            <span style={{ color: "var(--holy-gold)" }}>→</span>
          </button>
        );
      })}
    </Screen>
  );
}

function RoutineDetail({ r, onBack, onPlay, onComplete, done }) {
  return (
    <Screen>
      <button onClick={onBack} style={backB}>← ROUTINES</button>
      <ScreenTop kicker={`[ ${r.tier.toUpperCase()} · ${r.mins} MIN ]`} title={r.name} />
      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#9A948A", marginBottom: 18 }}>{r.focus}</div>
      {r.ex.map(([name, detail], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "14px 16px", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--holy-gold)", width: 22 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ flex: 1, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>{name}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9A948A" }}>{detail}</span>
        </div>
      ))}
      <div style={{ marginTop: 18 }}><GoldBtn onClick={onPlay}>Begin Workout ▸</GoldBtn></div>
      <div style={{ marginTop: 10 }}>{done ? <SystemLine>Iron logged. The body is tempered.</SystemLine> : <GhostBtn onClick={onComplete}>Quick Log (skip player)</GhostBtn>}</div>
    </Screen>
  );
}

// ── WORKOUT PLAYER ──
function WorkoutPlayer({ r, onBack, onDone }) {
  const [idx, setIdx] = useBS(0);
  const [resting, setResting] = useBS(false);
  const [rest, setRest] = useBS(45);
  const [fin, setFin] = useBS(false);
  useBE(() => {
    if (!resting) return;
    if (rest <= 0) { setResting(false); setIdx(i => i + 1); return; }
    const t = setTimeout(() => setRest(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [resting, rest]);

  const ex = r.ex[idx];
  const completeSet = () => { if (idx < r.ex.length - 1) { setRest(45); setResting(true); } else setFin(true); };

  if (fin) return (
    <Screen noTabSpace>
      <div style={{ textAlign: "center", paddingTop: 36 }}>
        <Seal size={120} id="wp-done" />
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, color: "var(--holy-gold)", letterSpacing: "0.18em", margin: "18px 0 8px" }}>FORGED</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#B8B2A6", maxWidth: 280, margin: "0 auto 24px" }}>{r.name} complete. {r.ex.length} movements. The body is tempered.</p>
        <GoldBtn onClick={onDone}>Log Iron & Return</GoldBtn>
      </div>
    </Screen>
  );

  return (
    <div style={{ height: "100%", background: resting ? "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(60,90,120,0.18), #0A0A0A 70%)" : "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,97,0.12), #0A0A0A 70%)", display: "flex", flexDirection: "column", padding: "64px 24px 40px", position: "relative" }}>
      <button onClick={onBack} style={{ position: "absolute", top: 56, left: 22, ...backB, marginBottom: 0 }}>← EXIT</button>
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#9A948A", letterSpacing: "0.2em" }}>MOVEMENT {idx + 1} / {r.ex.length}</div>
        <div style={{ height: 4, background: "rgba(201,169,97,0.12)", margin: "12px 0 0" }}><div style={{ height: "100%", width: `${((idx) / r.ex.length) * 100}%`, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)", transition: "width .4s" }} /></div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        {resting ? (
          <>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, color: "#9FB8C9", letterSpacing: "0.2em", marginBottom: 12 }}>REST</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 72, color: "var(--holy-ivory)" }}>{rest}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#9A948A", marginTop: 10 }}>Next: {r.ex[idx + 1][0]}</div>
            <div style={{ marginTop: 22 }}><button onClick={() => { setResting(false); setIdx(i => i + 1); }} style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.12em", color: "var(--holy-gold)", background: "transparent", border: "1px solid rgba(201,169,97,0.5)", padding: "12px 28px", cursor: "pointer" }}>SKIP REST</button></div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Pirata One', serif", fontSize: 44, color: "var(--holy-ivory)", lineHeight: 1.05 }}>{ex[0]}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "var(--holy-gold)", marginTop: 14, letterSpacing: "0.06em" }}>{ex[1]}</div>
          </>
        )}
      </div>
      {!resting && <GoldBtn onClick={completeSet}>{idx < r.ex.length - 1 ? "Set Complete ▸" : "Finish Workout"}</GoldBtn>}
    </div>
  );
}

// ── TABATA ──
const TABATA_MOVES = ["Burpees", "Mountain Climbers", "Squat Jumps", "Push-ups", "High Knees", "KB Swing", "Sit-ups", "Plank Jacks", "Lunges", "Sprawls"];
function Stepper({ label, value, set, min, max, step, unit }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.16em", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(201,169,97,0.3)" }}>
        <button onClick={() => set(Math.max(min, value - step))} style={{ flex: "0 0 36px", height: 42, background: "rgba(201,169,97,0.08)", border: "none", color: "var(--holy-gold)", fontSize: 18, cursor: "pointer" }}>−</button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--holy-ivory)" }}>{value}<span style={{ fontSize: 10, color: "#9A948A" }}>{unit}</span></div>
        <button onClick={() => set(Math.min(max, value + step))} style={{ flex: "0 0 36px", height: 42, background: "rgba(201,169,97,0.08)", border: "none", color: "var(--holy-gold)", fontSize: 18, cursor: "pointer" }}>+</button>
      </div>
    </div>
  );
}
function TabataBuilder({ s, actions, onBack, onStart }) {
  const [work, setWork] = useBS(20);
  const [rest, setRest] = useBS(10);
  const [rounds, setRounds] = useBS(8);
  const [moves, setMoves] = useBS(["Burpees", "Mountain Climbers"]);
  const total = (work + rest) * rounds;
  const mm = String(Math.floor(total / 60)).padStart(2, "0"), ss = String(total % 60).padStart(2, "0");
  const toggle = (m) => setMoves(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);
  const load = (p) => { setWork(p.work); setRest(p.rest); setRounds(p.rounds); setMoves(p.moves); };

  return (
    <Screen>
      <button onClick={onBack} style={backB}>← IRON</button>
      <ScreenTop kicker="[ FORGE YOUR OWN ]" title="Tabata" />
      {s.tabataPresets.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 8 }}>YOUR PRESETS</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{s.tabataPresets.map((p, i) => <button key={i} onClick={() => load(p)} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", background: "rgba(201,169,97,0.08)", border: "1px solid rgba(201,169,97,0.35)", padding: "8px 11px" }}>{p.name}</button>)}</div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Stepper label="WORK" value={work} set={setWork} min={5} max={120} step={5} unit="s" />
        <Stepper label="REST" value={rest} set={setRest} min={0} max={90} step={5} unit="s" />
        <Stepper label="ROUNDS" value={rounds} set={setRounds} min={1} max={20} step={1} unit="" />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>MOVEMENTS ({moves.length})</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {TABATA_MOVES.map(m => <button key={m} onClick={() => toggle(m)} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, color: moves.includes(m) ? "#0A0A0A" : "#B8B2A6", background: moves.includes(m) ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "8px 11px" }}>{m}</button>)}
      </div>
      <div style={{ textAlign: "center", border: "1px solid rgba(201,169,97,0.3)", background: "rgba(20,20,26,0.6)", padding: "16px", marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.2em" }}>TOTAL TIME</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 32, color: "var(--holy-gold)", marginTop: 4 }}>{mm}:{ss}</div>
      </div>
      <GoldBtn disabled={!moves.length} onClick={() => onStart({ work, rest, rounds, moves })}>Forge & Begin</GoldBtn>
      <div style={{ marginTop: 10 }}><GhostBtn onClick={() => { if (moves.length) actions.savePreset({ name: `${work}/${rest}×${rounds}`, work, rest, rounds, moves }); }}>Save as Preset</GhostBtn></div>
    </Screen>
  );
}
function TabataTimer({ cfg, onBack, onDone }) {
  const phases = useBR([]);
  if (!phases.current.length) {
    const arr = [];
    for (let r = 0; r < cfg.rounds; r++) {
      arr.push({ kind: "WORK", secs: cfg.work, move: cfg.moves[r % cfg.moves.length], round: r + 1 });
      if (cfg.rest > 0 && r < cfg.rounds - 1) arr.push({ kind: "REST", secs: cfg.rest, move: "Recover", round: r + 1 });
    }
    phases.current = arr;
  }
  const [idx, setIdx] = useBS(0);
  const [left, setLeft] = useBS(phases.current[0].secs);
  const [running, setRunning] = useBS(true);
  const [finished, setFinished] = useBS(false);
  useBE(() => {
    if (!running || finished) return;
    const t = setInterval(() => {
      setLeft(l => {
        if (l > 1) return l - 1;
        setIdx(i => { if (i + 1 >= phases.current.length) { setFinished(true); setRunning(false); return i; } setTimeout(() => setLeft(phases.current[i + 1].secs), 0); return i + 1; });
        return 0;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, finished, idx]);
  const ph = phases.current[idx]; const isWork = ph.kind === "WORK"; const col = isWork ? "var(--holy-gold)" : "#6E8AA0";
  if (finished) return (
    <Screen noTabSpace><div style={{ textAlign: "center", paddingTop: 40 }}>
      <Seal size={120} id="tb-done" />
      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, color: "var(--holy-gold)", letterSpacing: "0.18em", margin: "18px 0 8px" }}>FORGED</div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#B8B2A6", maxWidth: 280, margin: "0 auto 24px" }}>{cfg.rounds} rounds complete. The body is tempered.</p>
      <GoldBtn onClick={onDone}>Log Iron & Return</GoldBtn>
    </div></Screen>
  );
  return (
    <div style={{ height: "100%", background: isWork ? "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,97,0.16), #0A0A0A 70%)" : "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(60,90,120,0.18), #0A0A0A 70%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 28px", position: "relative" }}>
      <button onClick={onBack} style={{ position: "absolute", top: 56, left: 22, background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer" }}>← EDIT</button>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9A948A", letterSpacing: "0.2em" }}>ROUND {ph.round} / {cfg.rounds}</div>
      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 22, color: col, letterSpacing: "0.2em", margin: "12px 0 18px" }}>{ph.kind}</div>
      <div style={{ position: "relative", width: 200, height: 200, display: "grid", placeItems: "center" }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(201,169,97,0.12)" strokeWidth="4" />
          <circle cx="100" cy="100" r="92" fill="none" stroke={col} strokeWidth="4" strokeDasharray={2 * Math.PI * 92} strokeDashoffset={2 * Math.PI * 92 * (1 - left / ph.secs)} style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 56, color: "var(--holy-ivory)" }}>{left}</div>
      </div>
      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 24, color: "var(--holy-ivory)", marginTop: 22 }}>{ph.move}</div>
      <div style={{ marginTop: 26 }}><button onClick={() => setRunning(r => !r)} style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.12em", color: "var(--holy-gold)", background: "transparent", border: "1px solid rgba(201,169,97,0.5)", padding: "12px 28px", cursor: "pointer" }}>{running ? "PAUSE" : "RESUME"}</button></div>
    </div>
  );
}

// ── HISTORY + PRs ──
function BodyHistory({ s, onBack }) {
  return (
    <Screen>
      <button onClick={onBack} style={backB}>← IRON</button>
      <ScreenTop kicker="[ THE LEDGER ]" title="History" />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>PERSONAL RECORDS</div>
      <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", marginBottom: 18 }}>
        {Object.entries(s.prs).map(([k, v], i) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 15px", borderBottom: i < Object.keys(s.prs).length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>{k}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--holy-gold)" }}>{v}</span>
        </div>)}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>RECENT SESSIONS</div>
      {s.workoutHistory.map((w, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(201,169,97,0.18)", background: "#0E0E12", padding: "13px 15px", marginBottom: 8 }}>
          <div><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>{w.name}</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7A746A", letterSpacing: "0.1em", marginTop: 2 }}>{w.date}</div></div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--holy-gold)" }}>{w.mins} min</span>
        </div>
      ))}
    </Screen>
  );
}

Object.assign(window, { BodyScreen, RoutineDetail, WorkoutPlayer, TabataBuilder, TabataTimer, BodyHistory });
