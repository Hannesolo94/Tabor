// proto-pillars.jsx — Scripture Raid, Fitness Guild, Brotherhood screens
const { useState: usePS } = React;

function DoneBanner({ line, go }) {
  return (
    <div style={{ marginTop: 18 }}>
      <SystemLine>{line}</SystemLine>
      <div style={{ marginTop: 12 }}><GoldBtn onClick={() => go("quests")}>Return to Quests</GoldBtn></div>
    </div>
  );
}

// ── SCRIPTURE RAID ──
const VERSES = [
  "In the beginning was the Word, and the Word was with God, and the Word was God.",
  "The same was in the beginning with God.",
  "All things were made by him; and without him was not any thing made that was made.",
  "In him was life; and the life was the light of men.",
  "And the light shineth in darkness; and the darkness comprehended it not.",
];
const QUIZ = [
  { q: "“In the beginning was the ___.”", a: ["Word", "Light", "Law"], correct: 0 },
  { q: "In him was life, and the life was the ___ of men.", a: ["hope", "light", "bread"], correct: 1 },
  { q: "The darkness ___ it not.", a: ["comprehended", "conquered", "consumed"], correct: 0 },
];

function ScriptureScreen({ s, actions, go }) {
  const q = s.quests.find(x => x.id === "scout");
  const [mode, setMode] = usePS(q.done ? "done" : "read"); // read | drill | done
  const [qi, setQi] = usePS(0);
  const [pick, setPick] = usePS(null);
  const [score, setScore] = usePS(0);

  const answer = (i) => {
    if (pick !== null) return;
    setPick(i);
    const correct = i === QUIZ[qi].correct;
    setTimeout(() => {
      const ns = score + (correct ? 1 : 0);
      if (qi < QUIZ.length - 1) { setQi(qi + 1); setPick(null); setScore(ns); }
      else { setScore(ns); actions.completeQuest("scout"); setMode("done"); }
    }, 650);
  };

  return (
    <Screen>
      <ScreenTop kicker="[ SCRIPTURE RAID ]" title="Scout" right={<Seal size={40} id="sc-seal" />} />
      {mode === "read" && (
        <>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>JOHN 1 : 1 to 5</div>
          <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "20px 18px" }}>
            {VERSES.map((v, i) => (
              <p key={i} style={{ fontFamily: "var(--font-scripture)", fontSize: 18, lineHeight: 1.55, color: "#CFC9BD", margin: "0 0 12px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", verticalAlign: "super", marginRight: 6 }}>{i + 1}</span>{v}
              </p>
            ))}
          </div>
          <div style={{ marginTop: 16 }}><GoldBtn onClick={() => setMode("drill")}>Begin the Drill</GoldBtn></div>
        </>
      )}
      {mode === "drill" && (
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.2em", marginBottom: 14 }}>DRILL {qi + 1} / {QUIZ.length}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, color: "var(--holy-ivory)", lineHeight: 1.35, marginBottom: 18 }}>{QUIZ[qi].q}</div>
          {QUIZ[qi].a.map((opt, i) => {
            const chosen = pick === i;
            const isCorrect = i === QUIZ[qi].correct;
            const bg = pick === null ? "rgba(232,226,213,0.03)" : chosen ? (isCorrect ? "rgba(201,169,97,0.2)" : "rgba(122,31,31,0.25)") : (isCorrect ? "rgba(201,169,97,0.12)" : "rgba(232,226,213,0.03)");
            const bd = pick !== null && isCorrect ? "rgba(201,169,97,0.6)" : chosen ? "rgba(192,58,58,0.5)" : "rgba(201,169,97,0.25)";
            return (
              <button key={i} onClick={() => answer(i)} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: bg, border: `1px solid ${bd}`, padding: "15px 16px", marginBottom: 10, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--holy-ivory)" }}>{opt}</button>
            );
          })}
        </div>
      )}
      {mode === "done" && <DoneBanner line={SYSTEM.questDone.scout + ` Drill: ${score}/${QUIZ.length}.`} go={go} />}
    </Screen>
  );
}

// ── FITNESS GUILD ──
function BodyScreen({ s, actions, go }) {
  const q = s.quests.find(x => x.id === "iron");
  const opts = [
    ["Log a 20-minute workout", "Strength + conditioning", "STR"],
    ["Log 7,500 steps", "Today's movement", "AGI"],
  ];
  return (
    <Screen>
      <ScreenTop kicker="[ FITNESS GUILD ]" title="Iron" right={<Seal size={40} id="bd-seal" />} />
      {!q.done ? (
        <>
          <SystemLine>The body is a temple. Train it, {s.cls}.</SystemLine>
          <div style={{ marginTop: 16 }}>
            {opts.map(([t, sub, stat], i) => (
              <button key={i} onClick={() => actions.completeQuest("iron")} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", cursor: "pointer", background: "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.25)", padding: "18px 16px", marginBottom: 12 }}>
                <svg width="26" height="20" viewBox="0 0 24 20"><g fill="none" stroke="#C9A961" strokeWidth="1.6"><rect x="0" y="7" width="3" height="6" /><rect x="3" y="4" width="3" height="12" /><rect x="6" y="9" width="12" height="2" /><rect x="18" y="4" width="3" height="12" /><rect x="21" y="7" width="3" height="6" /></g></svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--holy-ivory)" }}>{t}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A" }}>{sub}</div>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)" }}>+{stat}</span>
              </button>
            ))}
          </div>
        </>
      ) : <DoneBanner line={SYSTEM.questDone.iron} go={go} />}
    </Screen>
  );
}

// ── BROTHERHOOD ──
const GUILD_FEED = [
  ["Marcus", "Crusader", "Scouted the chapter before dawn. Hard day ahead, holding."],
  ["Elias", "Scribe", "Skipped the gym but read double. Brothers, keep me honest."],
  ["Tomas", "Sentinel", "47 days. Not stopping. Who is climbing with me today?"],
];
function GuildScreen({ s, actions, go }) {
  const q = s.quests.find(x => x.id === "line");
  const [line, setLine] = usePS(s.guildLine || "");
  return (
    <Screen>
      <ScreenTop kicker="[ BROTHERHOOD ]" title="Guild" right={<Seal size={40} id="gd-seal" />} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>Sons of Tabor · IV</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.14em" }}>9 BROTHERS</span>
      </div>
      {GUILD_FEED.map(([n, c, l], i) => (
        <div key={i} style={{ display: "flex", gap: 12, border: "1px solid rgba(201,169,97,0.18)", background: "#0E0E12", padding: "13px 14px", marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", border: "1px solid rgba(201,169,97,0.4)", display: "grid", placeItems: "center", fontFamily: "'Pirata One', serif", fontSize: 17, color: "var(--holy-gold)" }}>{n[0]}</div>
          <div style={{ flex: 1 }}>
            <div><span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "var(--holy-ivory)" }}>{n}</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--holy-gold)", letterSpacing: "0.12em", marginLeft: 8 }}>{c.toUpperCase()}</span></div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#B8B2A6", marginTop: 3, lineHeight: 1.45 }}>{l}</div>
          </div>
        </div>
      ))}
      {!q.done ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 8 }}>YOUR LINE TODAY</div>
          <textarea value={line} onChange={e => setLine(e.target.value)} placeholder="One honest line..." rows={3} style={{ width: "100%", boxSizing: "border-box", background: "rgba(232,226,213,0.04)", border: "1px solid rgba(201,169,97,0.3)", color: "var(--holy-ivory)", fontFamily: "var(--font-body)", fontSize: 14, padding: "12px", resize: "none", outline: "none" }} />
          <div style={{ marginTop: 10 }}>
            <GoldBtn disabled={!line.trim()} onClick={() => { actions.setGuildLine(line); actions.completeQuest("line"); }}>Hold the Line</GoldBtn>
          </div>
        </div>
      ) : <DoneBanner line={SYSTEM.questDone.line} go={go} />}
    </Screen>
  );
}

Object.assign(window, { ScriptureScreen, BodyScreen, GuildScreen, DoneBanner });
