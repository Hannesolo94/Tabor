// proto-rankup.jsx — Rank-up ceremony with guild-notify beat
const { useState: useRuS, useEffect: useRuE } = React;

const BROTHERS = [
  ["Marcus", "Crusader", "Forged. Respect, brother."],
  ["Elias", "Scribe", "The climb continues. Proud of you."],
  ["Tomas", "Sentinel", "Knew you had it. Onward."],
];

function RankUp({ rank, name, onClose }) {
  const [phase, setPhase] = useRuS(0); // 0 reveal, 1 notify
  useRuE(() => { const t = setTimeout(() => setPhase(1), 2600); return () => clearTimeout(t); }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 90, background: "radial-gradient(ellipse 70% 50% at 50% 36%, rgba(24,20,12,0.97), rgba(8,8,8,0.99))", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 26px", overflowY: "auto" }}>
      <style>{`
        @keyframes ru-flash{0%{opacity:0}10%{opacity:.65}100%{opacity:0}}
        @keyframes ru-seal{0%{opacity:0;transform:scale(.5) rotate(-8deg);filter:blur(10px)}100%{opacity:1;transform:none;filter:none}}
        @keyframes ru-t{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes ru-ray{from{opacity:0;transform:scale(.6)}to{opacity:.5;transform:scale(1)}}
        @keyframes ru-card{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
      `}</style>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 38%, rgba(244,226,172,0.55), transparent 52%)", animation: "ru-flash 2s ease-out both", pointerEvents: "none" }} />
      {/* rays */}
      <svg width="320" height="320" viewBox="0 0 320 320" style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", animation: "ru-ray 1.4s ease .2s both" }}>
        {Array.from({ length: 16 }).map((_, i) => { const a = (i * Math.PI * 2) / 16; return <line key={i} x1={160} y1={160} x2={160 + Math.cos(a) * 150} y2={160 + Math.sin(a) * 150} stroke="#C9A961" strokeWidth="1" opacity="0.4" />; })}
      </svg>

      <div style={{ textAlign: "center", position: "relative" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--holy-gold)", letterSpacing: "0.3em", animation: "ru-t .6s ease both" }}>[ RANK ATTAINED ]</div>
        <div style={{ animation: "ru-seal 1.3s cubic-bezier(.2,.9,.2,1) .2s both", display: "flex", justifyContent: "center", margin: "20px 0 8px" }}><TaborIconSeal id="ru-seal" size={150} /></div>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 54, color: "var(--holy-gold)", animation: "ru-t .8s ease 1s both", lineHeight: 1 }}>{rank}</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#B8B2A6", maxWidth: 300, margin: "12px auto 0", lineHeight: 1.55, animation: "ru-t .8s ease 1.3s both" }}>The System has forged you, {name}. You climb as {rank} now.</p>
      </div>

      {/* guild notified */}
      {phase === 1 && (
        <div style={{ width: "100%", maxWidth: 340, marginTop: 30, animation: "ru-card .7s cubic-bezier(.2,.8,.2,1) both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, justifyContent: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--holy-gold)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.2em" }}>YOUR GUILD HAS BEEN TOLD</span>
          </div>
          {BROTHERS.map(([n, c, msg], i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid rgba(201,169,97,0.2)", background: "rgba(20,20,26,0.6)", padding: "11px 13px", marginBottom: 8, animation: `ru-card .6s ease ${0.2 + i * 0.18}s both` }}>
              <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", border: "1px solid rgba(201,169,97,0.4)", display: "grid", placeItems: "center", fontFamily: "'Pirata One', serif", fontSize: 16, color: "var(--holy-gold)" }}>{n[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div><span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "var(--holy-ivory)" }}>{n}</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--holy-gold)", letterSpacing: "0.1em", marginLeft: 8 }}>{c.toUpperCase()}</span></div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#B8B2A6", marginTop: 2 }}>{msg}</div>
              </div>
              <span style={{ color: "var(--holy-gold)", fontSize: 14 }}>⚡</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 340, marginTop: 24, animation: "ru-t .8s ease 1.6s both" }}>
        <GoldBtn onClick={onClose}>Continue the Climb</GoldBtn>
      </div>
    </div>
  );
}

Object.assign(window, { RankUp });
