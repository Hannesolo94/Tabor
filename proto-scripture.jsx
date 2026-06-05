// proto-scripture.jsx — Scripture Raid: daily verse, reader/drill, Bible, plans, bookmarks, search, prayers
const { useState: useScS } = React;

const BOOKS = [
  ["Genesis",50,"O"],["Exodus",40,"O"],["Leviticus",27,"O"],["Numbers",36,"O"],["Deuteronomy",34,"O"],
  ["Joshua",24,"O"],["Judges",21,"O"],["Ruth",4,"O"],["1 Samuel",31,"O"],["2 Samuel",24,"O"],
  ["1 Kings",22,"O"],["2 Kings",25,"O"],["Psalms",150,"O"],["Proverbs",31,"O"],["Ecclesiastes",12,"O"],
  ["Isaiah",66,"O"],["Jeremiah",52,"O"],["Daniel",12,"O"],
  ["Matthew",28,"N"],["Mark",16,"N"],["Luke",24,"N"],["John",21,"N"],["Acts",28,"N"],
  ["Romans",16,"N"],["1 Corinthians",16,"N"],["2 Corinthians",13,"N"],["Galatians",6,"N"],
  ["Ephesians",6,"N"],["Philippians",4,"N"],["Hebrews",13,"N"],["James",5,"N"],["1 Peter",5,"N"],
  ["1 John",5,"N"],["Revelation",22,"N"],
];
const TEXT = {
  "John 1": ["In the beginning was the Word, and the Word was with God, and the Word was God.","The same was in the beginning with God.","All things were made by him; and without him was not any thing made that was made.","In him was life; and the life was the light of men.","And the light shineth in darkness; and the darkness comprehended it not.","There was a man sent from God, whose name was John.","The same came for a witness, to bear witness of the Light, that all men through him might believe.","He was not that Light, but was sent to bear witness of that Light.","That was the true Light, which lighteth every man that cometh into the world."],
  "Psalms 23": ["The LORD is my shepherd; I shall not want.","He maketh me to lie down in green pastures: he leadeth me beside the still waters.","He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.","Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.","Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.","Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever."],
  "Proverbs 27": ["Boast not thyself of to morrow; for thou knowest not what a day may bring forth.","Let another man praise thee, and not thine own mouth.","A stone is heavy, and the sand weighty; but a fool's wrath is heavier than them both.","Iron sharpeneth iron; so a man sharpeneth the countenance of his friend."],
  "Genesis 1": ["In the beginning God created the heaven and the earth.","And the earth was without form, and void; and darkness was upon the face of the deep.","And the Spirit of God moved upon the face of the waters.","And God said, Let there be light: and there was light.","And God saw the light, that it was good: and God divided the light from the darkness."],
};
const DAILY = [["Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.","Proverbs 27:17"],["Be strong and of a good courage; be not afraid, neither be thou dismayed.","Joshua 1:9"],["I can do all things through Christ which strengtheneth me.","Philippians 4:13"],["Watch ye, stand fast in the faith, quit you like men, be strong.","1 Corinthians 16:13"]];
function verseOfDay() { return DAILY[new Date().getDate() % DAILY.length]; }
const PLANS = [["The Gospels Track","Read through Matthew to John","42%","John 1"],["Foundations · 40 Days","Core passages for the new believer","18%","Genesis 1"],["Psalms of Strength","30 days in the Psalms","63%","Psalms 23"]];
const SC_DRILL = [{ q: "“In the beginning was the ___.”", a: ["Word", "Light", "Law"], c: 0 },{ q: "In him was life; the life was the ___ of men.", a: ["hope", "light", "bread"], c: 1 },{ q: "Iron sharpeneth ___.", a: ["iron", "steel", "stone"], c: 0 }];
const backBtn = { background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: 14 };

function Verse({ v, i, refStr, marked, onTap }) {
  return (
    <p onClick={onTap} style={{ fontFamily: "var(--font-scripture)", fontSize: 17, lineHeight: 1.6, color: "#CFC9BD", margin: "0 0 10px", cursor: "pointer", paddingLeft: 10, borderLeft: marked ? "2px solid var(--holy-gold)" : "2px solid transparent", background: marked ? "rgba(201,169,97,0.06)" : "transparent" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", verticalAlign: "super", marginRight: 6 }}>{i + 1}</span>{v}
    </p>
  );
}

function ScriptureScreen({ s, actions, go }) {
  const q = s.quests.find(x => x.id === "scout");
  const [view, setView] = useScS("hub");
  const [book, setBook] = useScS(null);
  const [chap, setChap] = useScS(1);
  const [qi, setQi] = useScS(0); const [pick, setPick] = useScS(null); const [score, setScore] = useScS(0);
  const [query, setQuery] = useScS("");
  const [dv, dref] = verseOfDay();

  const openRef = (ref) => { const m = ref.match(/^(.+) (\d+)/); if (m && TEXT[`${m[1]} ${m[2]}`]) { setBook([m[1], BOOKS.find(b => b[0] === m[1])?.[1] || 1]); setChap(+m[2]); setView("reader"); } };
  const answer = (i) => { if (pick !== null) return; setPick(i); const ok = i === SC_DRILL[qi].c; setTimeout(() => { const ns = score + (ok ? 1 : 0); if (qi < SC_DRILL.length - 1) { setQi(qi + 1); setPick(null); setScore(ns); } else { setScore(ns); actions.completeQuest("scout"); setView("done"); } }, 600); };

  const Tile = ({ icon, label, sub, onClick }) => (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", cursor: "pointer", background: "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.25)", padding: "15px 16px", marginBottom: 10 }}>
      <span style={{ fontSize: 18, color: "var(--holy-gold)", width: 22, textAlign: "center" }}>{icon}</span>
      <div style={{ flex: 1 }}><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--holy-ivory)" }}>{label}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A" }}>{sub}</div></div>
      <span style={{ color: "var(--holy-gold)" }}>→</span>
    </button>
  );

  if (view === "prayers") return <PrayerView denomination={s.denomination} onBack={() => setView("hub")} />;
  if (view === "seeker") return <SeekerTrack s={s} actions={actions} onBack={() => setView("hub")} />;

  if (view === "bible") return (
    <Screen>
      <button onClick={() => setView("hub")} style={backBtn}>← SCRIPTURE</button>
      <ScreenTop kicker="[ THE BIBLE ]" title="Books" />
      {["O", "N"].map(test => (
        <div key={test} style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>{test === "O" ? "OLD TESTAMENT" : "NEW TESTAMENT"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {BOOKS.filter(b => b[2] === test).map(([name, ch]) => <button key={name} onClick={() => { setBook([name, ch]); setChap(1); setView("reader"); }} style={{ textAlign: "left", cursor: "pointer", background: "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.2)", padding: "12px 13px" }}><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "var(--holy-ivory)" }}>{name}</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#6E6A60", letterSpacing: "0.1em", marginTop: 2 }}>{ch} CH</div></button>)}
          </div>
        </div>
      ))}
    </Screen>
  );

  if (view === "reader" && book) {
    const key = `${book[0]} ${chap}`; const verses = TEXT[key];
    return (
      <Screen>
        <button onClick={() => setView("bible")} style={backBtn}>← BOOKS</button>
        <ScreenTop kicker={`[ ${book[0].toUpperCase()} ]`} title={`Chapter ${chap}`} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {Array.from({ length: book[1] }).slice(0, 24).map((_, i) => <button key={i} onClick={() => setChap(i + 1)} style={{ width: 32, height: 32, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11, color: chap === i + 1 ? "#0A0A0A" : "#9A948A", background: chap === i + 1 ? "var(--holy-gold)" : "transparent", border: "1px solid rgba(201,169,97,0.3)" }}>{i + 1}</button>)}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#6E6A60", letterSpacing: "0.14em", marginBottom: 8 }}>TAP A VERSE TO BOOKMARK</div>
        <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "18px 16px" }}>
          {verses ? verses.map((v, i) => <Verse key={i} v={v} i={i} marked={s.bookmarks.includes(`${key}:${i + 1}`)} onTap={() => actions.toggleBookmark(`${key}:${i + 1}`)} />) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}><Seal size={56} id="bible-empty" /><p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#9A948A", marginTop: 12, lineHeight: 1.5 }}>Full text for {book[0]} {chap} loads from the scripture service in the live build. Try John 1, Psalms 23, Proverbs 27, or Genesis 1.</p></div>
          )}
        </div>
      </Screen>
    );
  }

  if (view === "plans") return (
    <Screen>
      <button onClick={() => setView("hub")} style={backBtn}>← SCRIPTURE</button>
      <ScreenTop kicker="[ READING PLANS ]" title="Plans" />
      {PLANS.map(([name, sub, pct, ref]) => (
        <div key={name} style={{ border: "1px solid rgba(201,169,97,0.22)", background: "#0E0E12", padding: "16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--holy-ivory)" }}>{name}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A", marginTop: 3 }}>{sub}</div>
          <div style={{ height: 7, background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.3)", position: "relative", margin: "12px 0 8px" }}><div style={{ position: "absolute", inset: 0, width: pct, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)" }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)" }}>{pct} complete</span>
            <button onClick={() => openRef(ref)} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", background: "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "7px 12px" }}>TODAY'S READING ›</button>
          </div>
        </div>
      ))}
    </Screen>
  );

  if (view === "bookmarks") return (
    <Screen>
      <button onClick={() => setView("hub")} style={backBtn}>← SCRIPTURE</button>
      <ScreenTop kicker="[ SAVED ]" title="Bookmarks" />
      {s.bookmarks.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: "#6E6A60", fontFamily: "var(--font-body)", fontSize: 13 }}>No bookmarks yet. Tap a verse in the reader to save it.</div> :
        s.bookmarks.map(ref => { const m = ref.match(/^(.+) (\d+):(\d+)$/); const verse = m && TEXT[`${m[1]} ${m[2]}`] ? TEXT[`${m[1]} ${m[2]}`][+m[3] - 1] : ""; return (
          <div key={ref} style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "14px 15px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><button onClick={() => openRef(ref)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.14em", padding: 0 }}>{ref.toUpperCase()}</button><button onClick={() => actions.toggleBookmark(ref)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6E6A60", fontSize: 13 }}>✕</button></div>
            {verse && <p style={{ fontFamily: "var(--font-scripture)", fontStyle: "italic", fontSize: 15, color: "#CFC9BD", margin: 0, lineHeight: 1.5 }}>{verse}</p>}
          </div>
        ); })}
    </Screen>
  );

  if (view === "search") {
    const ql = query.toLowerCase().trim();
    const bookHits = ql ? BOOKS.filter(b => b[0].toLowerCase().includes(ql)) : [];
    const verseHits = ql ? Object.entries(TEXT).flatMap(([k, vs]) => vs.map((v, i) => [k, i, v]).filter(([, , v]) => v.toLowerCase().includes(ql))) : [];
    return (
      <Screen>
        <button onClick={() => setView("hub")} style={backBtn}>← SCRIPTURE</button>
        <ScreenTop kicker="[ SEARCH ]" title="Find" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search books and verses..." autoFocus style={{ width: "100%", boxSizing: "border-box", background: "rgba(232,226,213,0.05)", border: "1px solid rgba(201,169,97,0.35)", color: "var(--holy-ivory)", fontFamily: "var(--font-body)", fontSize: 15, padding: "13px 14px", outline: "none", marginBottom: 16, borderRadius: 22 }} />
        {bookHits.length > 0 && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 8 }}>BOOKS</div>}
        {bookHits.map(([n, ch]) => <button key={n} onClick={() => { setBook([n, ch]); setChap(1); setView("reader"); }} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.2)", padding: "12px 14px", marginBottom: 8, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>{n}</button>)}
        {verseHits.length > 0 && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "10px 0 8px" }}>VERSES</div>}
        {verseHits.map(([k, i, v], j) => <button key={j} onClick={() => openRef(`${k}:${i + 1}`)} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: "#0E0E12", border: "1px solid rgba(201,169,97,0.18)", padding: "12px 14px", marginBottom: 8 }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--holy-gold)", letterSpacing: "0.14em" }}>{k}:{i + 1}</div><div style={{ fontFamily: "var(--font-scripture)", fontStyle: "italic", fontSize: 14, color: "#CFC9BD", marginTop: 4, lineHeight: 1.45 }}>{v}</div></button>)}
        {ql && bookHits.length === 0 && verseHits.length === 0 && <div style={{ textAlign: "center", padding: "30px 0", color: "#6E6A60", fontFamily: "var(--font-body)", fontSize: 13 }}>No results. Sample text covers John 1, Psalms 23, Proverbs 27, Genesis 1.</div>}
      </Screen>
    );
  }

  if (view === "read") return (
    <Screen>
      <button onClick={() => setView("hub")} style={backBtn}>← SCRIPTURE</button>
      <ScreenTop kicker="[ JOHN 1 : 1 to 9 ]" title="Scout" />
      <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "18px 16px" }}>
        {TEXT["John 1"].map((v, i) => <Verse key={i} v={v} i={i} marked={s.bookmarks.includes(`John 1:${i + 1}`)} onTap={() => actions.toggleBookmark(`John 1:${i + 1}`)} />)}
      </div>
      <div style={{ marginTop: 16 }}><GoldBtn onClick={() => setView("drill")}>Begin the Drill</GoldBtn></div>
    </Screen>
  );
  if (view === "drill") return (
    <Screen>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.2em", marginBottom: 14, paddingTop: 6 }}>DRILL {qi + 1} / {SC_DRILL.length}</div>
      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 20, color: "var(--holy-ivory)", lineHeight: 1.35, marginBottom: 18 }}>{SC_DRILL[qi].q}</div>
      {SC_DRILL[qi].a.map((opt, i) => { const chosen = pick === i, isC = i === SC_DRILL[qi].c; const bg = pick === null ? "rgba(232,226,213,0.03)" : chosen ? (isC ? "rgba(201,169,97,0.2)" : "rgba(122,31,31,0.25)") : (isC ? "rgba(201,169,97,0.12)" : "rgba(232,226,213,0.03)"); const bd = pick !== null && isC ? "rgba(201,169,97,0.6)" : chosen ? "rgba(192,58,58,0.5)" : "rgba(201,169,97,0.25)"; return <button key={i} onClick={() => answer(i)} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: bg, border: `1px solid ${bd}`, padding: "15px 16px", marginBottom: 10, fontFamily: "var(--font-body)", fontSize: 15, color: "var(--holy-ivory)" }}>{opt}</button>; })}
    </Screen>
  );
  if (view === "done") return (<Screen><ScreenTop kicker="[ SCRIPTURE RAID ]" title="Scouted" /><DoneBanner line={`The chapter is scouted. Wisdom rises. Drill: ${score}/${SC_DRILL.length}.`} go={go} /></Screen>);

  // HUB
  return (
    <Screen>
      <ScreenTop kicker="[ SCRIPTURE RAID ]" title="The Word" right={<Seal size={40} id="sc-seal" />} />
      <div style={{ border: "1px solid rgba(201,169,97,0.35)", background: "linear-gradient(180deg, rgba(201,169,97,0.1), rgba(201,169,97,0.02))", padding: "20px 18px", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", marginBottom: 10 }}>VERSE OF THE DAY</div>
        <p style={{ fontFamily: "var(--font-scripture)", fontStyle: "italic", fontSize: 20, lineHeight: 1.5, color: "var(--holy-ivory)", margin: 0 }}>“{dv}”</p>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.18em", marginTop: 10 }}>{dref.toUpperCase()}</div>
      </div>
      <button onClick={() => setView(q.done ? "done" : "read")} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", cursor: "pointer", background: q.done ? "rgba(201,169,97,0.08)" : "rgba(232,226,213,0.03)", border: "1px solid rgba(201,169,97,0.25)", padding: "16px", marginBottom: 12 }}>
        <div style={{ width: 22, height: 22, flexShrink: 0, display: "grid", placeItems: "center", border: `1.5px solid ${q.done ? "var(--holy-gold)" : "rgba(232,226,213,0.4)"}`, background: q.done ? "var(--holy-gold)" : "transparent" }}>{q.done && <svg width="12" height="9" viewBox="0 0 13 10"><polyline points="1,5 5,9 12,1" stroke="#0A0A0A" strokeWidth="2.2" fill="none" /></svg>}</div>
        <div style={{ flex: 1 }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--holy-gold)", letterSpacing: "0.18em" }}>TODAY'S RAID</div><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--holy-ivory)", marginTop: 2 }}>Scout the Chapter</div><div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A" }}>John 1 + a short drill</div></div>
        <span style={{ color: "var(--holy-gold)" }}>→</span>
      </button>
      <Tile icon="✝" label="Open the Bible" sub="66 books · read any chapter" onClick={() => setView("bible")} />
      <Tile icon="◈" label="Reading Plans" sub="Tracks with daily progress" onClick={() => setView("plans")} />
      <Tile icon="❑" label={`Bookmarks${s.bookmarks.length ? ` · ${s.bookmarks.length}` : ""}`} sub="Your saved verses" onClick={() => setView("bookmarks")} />
      <Tile icon="⌕" label="Search" sub="Find books and verses" onClick={() => { setQuery(""); setView("search"); }} />
      <Tile icon="✦" label="Daily Prayers" sub={`${s.denomination} tradition`} onClick={() => setView("prayers")} />
      {s.believer !== "yes" && <Tile icon="◇" label="Seeker Track" sub="Meet Jesus, step by step" onClick={() => setView("seeker")} />}
    </Screen>
  );
}

Object.assign(window, { ScriptureScreen });
