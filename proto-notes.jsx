// proto-notes.jsx — Notes (Bible + fitness), live System assistant, data deletion
const { useState: useNS, useEffect: useNE, useRef: useNR } = React;

const backBtnN = { background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: 14 };

// ── NOTES ──
function NotesView({ s, actions }) {
  const [filter, setFilter] = useNS("all");
  const [composing, setComposing] = useNS(false);
  const [cat, setCat] = useNS("scripture");
  const [title, setTitle] = useNS("");
  const [body, setBody] = useNS("");
  const notes = s.notes.filter(n => filter === "all" || n.cat === filter);

  const save = () => { if (!title.trim() && !body.trim()) return; actions.addNote({ cat, title: title.trim() || "Untitled", body: body.trim(), ref: "" }); setTitle(""); setBody(""); setComposing(false); };

  return (
    <div>
      {s.aiOptIn && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(201,169,97,0.35)", background: "rgba(201,169,97,0.06)", padding: "11px 13px", marginBottom: 14 }}>
          <span style={{ color: "var(--holy-gold)", fontSize: 15 }}>◇</span>
          <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 12, color: "#B8B2A6", lineHeight: 1.4 }}>The System is tracking your notes to guide your climb.</span>
        </div>
      )}
      <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
        {[["all", "All"], ["scripture", "Scripture"], ["fitness", "Fitness"]].map(([id, l]) => (
          <button key={id} onClick={() => setFilter(id)} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: filter === id ? "#0A0A0A" : "#9A948A", background: filter === id ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "8px 12px" }}>{l}</button>
        ))}
        <button onClick={() => setComposing(true)} style={{ marginLeft: "auto", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--holy-gold)", background: "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "8px 12px" }}>＋ New</button>
      </div>

      {composing && (
        <div style={{ border: "1px solid rgba(201,169,97,0.4)", background: "#0E0E12", padding: "14px", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {[["scripture", "Scripture"], ["fitness", "Fitness"]].map(([id, l]) => <button key={id} onClick={() => setCat(id)} style={{ flex: 1, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: cat === id ? "#0A0A0A" : "#9A948A", background: cat === id ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "9px 0" }}>{l.toUpperCase()}</button>)}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ width: "100%", boxSizing: "border-box", background: "rgba(232,226,213,0.04)", border: "1px solid rgba(201,169,97,0.3)", color: "var(--holy-ivory)", fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, padding: "10px 12px", outline: "none", marginBottom: 8 }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your reflection..." rows={4} style={{ width: "100%", boxSizing: "border-box", background: "rgba(232,226,213,0.04)", border: "1px solid rgba(201,169,97,0.3)", color: "var(--holy-ivory)", fontFamily: "var(--font-body)", fontSize: 14, padding: "10px 12px", outline: "none", resize: "none" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}><GhostBtn onClick={() => setComposing(false)}>Cancel</GhostBtn><GoldBtn onClick={save}>Save Note</GoldBtn></div>
        </div>
      )}

      {notes.length === 0 && !composing && <div style={{ textAlign: "center", padding: "30px 0", color: "#6E6A60", fontFamily: "var(--font-body)", fontSize: 13 }}>No notes yet. Write your first reflection.</div>}
      {notes.map(n => (
        <div key={n.id} style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "14px 15px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em", color: n.cat === "scripture" ? "var(--holy-gold)" : "#9FB8C9" }}>{n.cat.toUpperCase()}{n.ref ? ` · ${n.ref}` : ""}</span>
            <button onClick={() => actions.deleteNote(n.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6E6A60", fontSize: 14 }}>✕</button>
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>{n.title}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#9A948A", lineHeight: 1.5, marginTop: 4 }}>{n.body}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#5A554C", letterSpacing: "0.1em", marginTop: 8 }}>{n.date}</div>
        </div>
      ))}
    </div>
  );
}

// ── THE SYSTEM (AI assistant) ──
const FALLBACK = [
  "The numbers do not lie. Forty-seven days held. Your Wisdom climbs fastest. Press the iron harder this week.",
  "Read, then move, then answer for your brothers. In that order. The day bends to the man who starts it.",
  "Your weak link is the pull-up. Negatives and dead hangs. Report back in seven days.",
  "Rest is not weakness. Seal the day, then sleep. Dawn brings the next ascent.",
];
function SystemChat({ s, rankName, level }) {
  const [msgs, setMsgs] = useNS([{ who: "sys", text: `Dawn, ${s.name || "Hannes"}. You stand at ${rankName}, level ${level}, streak ${s.streak}. Ask, and I will measure your path.` }]);
  const [text, setText] = useNS("");
  const [busy, setBusy] = useNS(false);
  const scroller = useNR(null);
  useNE(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs.length, busy]);

  const send = async () => {
    if (!text.trim() || busy) return;
    const q = text.trim(); setMsgs(m => [...m, { who: "me", text: q }]); setText(""); setBusy(true);
    let reply = "";
    try {
      const prompt = `You are "The System", the AI guide inside TABOR, a Christian brotherhood fitness app. You speak like the System from Solo Leveling crossed with an older brother in the faith: terse, commanding, sacred, encouraging, never cheesy, no emoji, no em dashes. Keep replies to 2-4 short sentences.\n\nUser context: name ${s.name || "Hannes"}, class ${s.cls}, rank ${rankName}, level ${level}, streak ${s.streak} days, tradition ${s.denomination}, goals ${(s.goals || []).join(", ")}.\n\nThe user says: "${q}"\n\nReply as The System:`;
      reply = await window.claude.complete(prompt);
    } catch (e) {
      reply = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    }
    setMsgs(m => [...m, { who: "sys", text: (reply || "").trim() || FALLBACK[0] }]); setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 520 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Seal size={34} id="sys-seal" />
        <div><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-ivory)" }}>The System</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#5BA86B", letterSpacing: "0.1em" }}>● ONLINE</div></div>
      </div>
      <div ref={scroller} style={{ flex: 1, overflowY: "auto", border: "1px solid rgba(201,169,97,0.18)", background: "#0C0C10", padding: "12px" }}>
        {msgs.map((m, i) => m.who === "sys" ? (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 4 }}>[ THE SYSTEM ]</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#CFC9BD", lineHeight: 1.5, background: "rgba(201,169,97,0.06)", border: "1px solid rgba(201,169,97,0.2)", padding: "10px 12px" }}><span style={{ color: "var(--holy-gold)" }}>▸ </span>{m.text}</div>
          </div>
        ) : (
          <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "82%", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--holy-ivory)", background: "rgba(232,226,213,0.06)", padding: "10px 12px", borderRadius: "12px 12px 2px 12px" }}>{m.text}</div>
          </div>
        ))}
        {busy && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--holy-gold)", letterSpacing: "0.18em" }}>▸ measuring...</div>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder="Ask the System..." style={{ flex: 1, background: "rgba(232,226,213,0.05)", border: "1px solid rgba(201,169,97,0.3)", color: "var(--holy-ivory)", fontFamily: "var(--font-body)", fontSize: 14, padding: "12px 14px", outline: "none", borderRadius: 22 }} />
        <button onClick={send} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: "50%", border: "none", background: text.trim() ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "rgba(201,169,97,0.2)", color: "#0A0A0A", cursor: "pointer", fontSize: 18 }}>➤</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {["Review my week", "What is my weak link?", "Encourage me"].map(p => <button key={p} onClick={() => setText(p)} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", background: "transparent", border: "1px solid rgba(201,169,97,0.3)", padding: "7px 10px" }}>{p}</button>)}
      </div>
    </div>
  );
}

// ── DATA DELETION ──
function DeleteData({ actions, onCancel }) {
  const [confirm, setConfirm] = useNS(false);
  const items = ["Your profile and name", "All progress, XP, ranks, and streaks", "Every note and reflection", "Workout and reading history", "Guild membership"];
  return (
    <div>
      <button onClick={onCancel} style={backBtnN}>← SETTINGS</button>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 30, color: "var(--holy-crimson-glow)" }}>⚠</div>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 22, color: "var(--holy-ivory)", margin: "8px 0 0" }}>Delete your data</h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "#9A948A", lineHeight: 1.55, marginTop: 8 }}>Your data is yours. This erases everything tied to your account, instantly and permanently. We keep no copy.</p>
      </div>
      <div style={{ border: "1px solid rgba(122,31,31,0.4)", background: "rgba(48,28,28,0.3)", padding: "16px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#E08585", letterSpacing: "0.18em", marginBottom: 10 }}>THIS WILL REMOVE</div>
        {items.map((it, i) => <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", fontFamily: "var(--font-body)", fontSize: 13, color: "#CFC9BD" }}><span style={{ color: "#E08585" }}>✕</span>{it}</div>)}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 2px", cursor: "pointer" }}>
        <span onClick={() => setConfirm(c => !c)} style={{ width: 22, height: 22, flexShrink: 0, border: "1.5px solid rgba(201,169,97,0.6)", background: confirm ? "var(--holy-gold)" : "transparent", display: "grid", placeItems: "center" }}>{confirm && <svg width="12" height="9" viewBox="0 0 13 10"><polyline points="1,5 5,9 12,1" stroke="#0A0A0A" strokeWidth="2.2" fill="none" /></svg>}</span>
        <span onClick={() => setConfirm(c => !c)} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#B8B2A6" }}>I understand this cannot be undone.</span>
      </label>
      <button onClick={() => { if (confirm) { actions.hardReset(); } }} disabled={!confirm} style={{ width: "100%", fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: confirm ? "#fff" : "#6E6A60", background: confirm ? "linear-gradient(180deg,#9A2A2A,#7A1F1F)" : "rgba(122,31,31,0.2)", border: "1px solid rgba(122,31,31,0.6)", padding: "15px", cursor: confirm ? "pointer" : "default" }}>Delete Everything</button>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6E6A60", letterSpacing: "0.1em", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>WE ONLY STORE WHAT THE APP NEEDS TO FUNCTION.<br />NO SELLING. NO SHARING. EVER.</p>
    </div>
  );
}

Object.assign(window, { NotesView, SystemChat, DeleteData });
