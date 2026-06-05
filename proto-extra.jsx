// proto-extra.jsx — Home dashboard, Notifications inbox, Seeker track
const { useState: useXS } = React;

// ── HOME DASHBOARD (top of Quests/Home) ──
function HomeSummary({ s, level, rankName, go }) {
  const done = s.quests.filter(q => q.done).length;
  const cards = [
    ["word", "✝", "Today's Word", "Verse + the Scout raid"],
    ["body", "▲", "Today's Iron", `${s.ironSteps.toLocaleString()} / ${s.ironGoal.toLocaleString()} steps`],
    ["guild", "⌂", "The Guild", "5 unread · 4 online"],
    ["status", "◇", "The System", "Notes, inbox, ranks"],
  ];
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(201,169,97,0.3)", background: "rgba(20,20,26,0.5)", padding: "12px 14px", marginBottom: 10 }}>
        <div><div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.16em" }}>TODAY</div><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)", marginTop: 2 }}>{done} of 3 trials held</div></div>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 22, color: "var(--holy-gold)" }}>🔥{s.streak}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {cards.map(([tab, ic, t, sub]) => (
          <button key={tab} onClick={() => go(tab)} style={{ textAlign: "left", cursor: "pointer", background: "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.2)", padding: "12px 13px" }}>
            <span style={{ fontSize: 16, color: "var(--holy-gold)" }}>{ic}</span>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13.5, color: "var(--holy-ivory)", marginTop: 6 }}>{t}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "#9A948A", marginTop: 2 }}>{sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── NOTIFICATIONS INBOX ──
const NK_ICON = { rank: "✦", nudge: "◇", guild: "⌂", quest: "▸", system: "◈" };
function InboxView({ s, actions, go }) {
  const tabFor = { rank: "status", nudge: "guild", guild: "guild", quest: "quests" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.16em" }}>{s.notifications.filter(n => !n.read).length} UNREAD</span>
        <button onClick={() => actions.markNotifsRead()} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.1em" }}>MARK ALL READ</button>
      </div>
      {s.notifications.map(n => (
        <button key={n.id} onClick={() => go && go(tabFor[n.kind] || "quests")} style={{ display: "flex", gap: 12, width: "100%", textAlign: "left", cursor: "pointer", background: n.read ? "transparent" : "rgba(201,169,97,0.06)", border: "1px solid rgba(201,169,97,0.18)", padding: "13px 14px", marginBottom: 8 }}>
          <span style={{ fontSize: 16, color: "var(--holy-gold)", flexShrink: 0 }}>{NK_ICON[n.kind]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13.5, color: "var(--holy-ivory)" }}>{n.title}</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#5A554C" }}>{n.time}</span></div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#9A948A", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
          </div>
          {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--holy-gold)", flexShrink: 0, marginTop: 4 }} />}
        </button>
      ))}
    </div>
  );
}

// ── SEEKER TRACK ──
const LESSONS = [
  ["who", "Who is Jesus?", "Jesus of Nazareth is the Son of God, fully God and fully man. He lived the life we could not, died the death we deserved, and rose again. To know Him is to know the Father. Start here: He is not a distant idea. He is a person who calls you by name."],
  ["gospel", "The Gospel", "The good news in one breath: God made you, sin separated you, Christ paid for you, and rising from the grave He opened the way home. It is not earned by climbing. It is received by faith. The climb is your response to grace, not the price of it."],
  ["prayer", "Your First Prayer", "Prayer is talking to God like He is real, because He is. You do not need the right words. Try this: 'God, I do not have it all figured out. But I want to know You. Meet me here.' Then listen. He is nearer than your breath."],
  ["church", "Finding a Church", "You were not made to climb alone, and faith is no different. Find a church that preaches the Bible and loves people. Show up. Ask questions. A guild of brothers in the faith will carry you further than willpower ever could."],
  ["bible", "Reading the Bible", "The Bible is how God speaks. Start with the Gospel of John to meet Jesus, then Psalms for the heart, then Proverbs for the day. Read a little, often. The Word is a weapon. Pick it up."],
];
function SeekerTrack({ s, actions, onBack }) {
  const [open, setOpen] = useXS(null);
  const doneCount = s.seekerLessons.length;
  if (open) {
    const [id, title, body] = LESSONS.find(l => l[0] === open);
    const isDone = s.seekerLessons.includes(id);
    return (
      <Screen>
        <button onClick={() => setOpen(null)} style={{ background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: 14 }}>← SEEKER TRACK</button>
        <ScreenTop kicker="[ THE GOSPEL ]" title={title} />
        <p style={{ fontFamily: "var(--font-scripture)", fontSize: 18, lineHeight: 1.65, color: "#CFC9BD" }}>{body}</p>
        <div style={{ marginTop: 18 }}>{isDone ? <SystemLine>Held. The light grows. Walk on to the next.</SystemLine> : <GoldBtn onClick={() => { actions.completeLesson(id); }}>Mark Complete</GoldBtn>}</div>
      </Screen>
    );
  }
  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: 14 }}>← SCRIPTURE</button>
      <ScreenTop kicker="[ SEEKER TRACK ]" title="Open Heart" right={<Seal size={40} id="seek-seal" />} />
      <SystemLine>You came in open. Walk this path and meet the One the whole climb is for.</SystemLine>
      <div style={{ margin: "14px 0", height: 7, background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.3)", position: "relative" }}><div style={{ position: "absolute", inset: 0, width: `${(doneCount / LESSONS.length) * 100}%`, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)" }} /></div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.14em", marginBottom: 14 }}>{doneCount} / {LESSONS.length} LESSONS</div>
      {LESSONS.map(([id, title], i) => { const done = s.seekerLessons.includes(id); return (
        <button key={id} onClick={() => setOpen(id)} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", cursor: "pointer", background: done ? "rgba(201,169,97,0.08)" : "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.22)", padding: "15px 16px", marginBottom: 10 }}>
          <div style={{ width: 26, height: 26, flexShrink: 0, display: "grid", placeItems: "center", border: `1.5px solid ${done ? "var(--holy-gold)" : "rgba(232,226,213,0.4)"}`, background: done ? "var(--holy-gold)" : "transparent", fontFamily: "var(--font-mono)", fontSize: 11, color: done ? "#0A0A0A" : "#9A948A" }}>{done ? "✓" : i + 1}</div>
          <span style={{ flex: 1, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>{title}</span>
          <span style={{ color: "var(--holy-gold)" }}>→</span>
        </button>
      ); })}
    </Screen>
  );
}

// ── AVATAR (upload + display) ──
function AvatarPick({ s, actions }) {
  const onFile = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => actions.setAvatar(r.result); r.readAsDataURL(f); };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(201,169,97,0.5)", flexShrink: 0, background: "#15151A", display: "grid", placeItems: "center" }}>
        {s.avatar ? <img src={s.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: "'Pirata One', serif", fontSize: 26, color: "var(--holy-gold)" }}>{(s.name || "H")[0]}</span>}
      </div>
      <label style={{ cursor: "pointer", fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", color: "var(--holy-gold)", border: "1px solid rgba(201,169,97,0.5)", padding: "10px 16px" }}>
        Upload Photo<input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      </label>
      {s.avatar && <button onClick={() => actions.setAvatar("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6E6A60", fontFamily: "var(--font-mono)", fontSize: 10 }}>REMOVE</button>}
    </div>
  );
}

Object.assign(window, { HomeSummary, InboxView, SeekerTrack, AvatarPick });
