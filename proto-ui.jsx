// proto-ui.jsx — TABOR prototype shared UI atoms
const TABS = [
  ["quests", "Quests", "◇"],
  ["scripture", "Word", "✝"],
  ["body", "Body", "▲"],
  ["guild", "Guild", "⌂"],
  ["store", "Store", "❖"],
  ["status", "Status", "◈"],
];

const ScrollCtx = React.createContext(() => {});

function TabBar({ active, onChange, hidden }) {
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 40,
      paddingBottom: 26, paddingTop: 12,
      background: "#0A0A0A", borderTop: "1px solid rgba(201,169,97,0.28)",
      boxShadow: "0 -8px 24px rgba(0,0,0,0.6)",
      transform: hidden ? "translateY(110%)" : "none",
      transition: "transform 0.32s cubic-bezier(.2,.8,.2,1)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-around", margin: "0 8px",
      }}>
        {TABS.map(([id, label, ic]) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => onChange(id)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, padding: "2px 0",
            }}>
              <span style={{ fontSize: 17, color: on ? "var(--holy-gold)" : "#6E6A60", lineHeight: 1 }}>{ic}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: on ? "var(--holy-gold)" : "#6E6A60" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Screen scroll container with safe-area padding for status bar + tab bar
function Screen({ children, pad = 20, noTabSpace }) {
  const onScroll = React.useContext(ScrollCtx);
  return (
    <div onScroll={e => onScroll(e.target.scrollTop)} style={{ height: "100%", overflowY: "auto", background: "#0A0A0A", WebkitOverflowScrolling: "touch" }}>
      <div style={{ padding: `64px ${pad}px ${noTabSpace ? 40 : 120}px` }}>{children}</div>
    </div>
  );
}

function ScreenTop({ kicker, title, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.24em" }}>{kicker}</div>
        <h1 style={{ fontFamily: "'Pirata One', serif", fontSize: 38, color: "var(--holy-ivory)", margin: "4px 0 0", lineHeight: 1 }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

// Small mountain seal (reuses TaborIconSeal from tabor-mark.jsx)
function Seal({ size = 40, id }) {
  return <TaborIconSeal id={id} size={size} />;
}

function StatBar({ label, value, max = 6000, glow }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", color: "#9A948A" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--holy-ivory)" }}>{value.toLocaleString()}</span>
      </div>
      <div style={{ position: "relative", height: 9, background: "rgba(201,169,97,0.1)", border: "1px solid rgba(201,169,97,0.3)" }}>
        <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)", transition: "width 0.7s cubic-bezier(.2,.8,.2,1)" }} />
      </div>
    </div>
  );
}

function GoldBtn({ children, onClick, style = {}, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase",
      color: "#0A0A0A", background: disabled ? "#4A4533" : "linear-gradient(180deg,#E8D08C,#C9A961)",
      border: "none", padding: "15px 22px", width: "100%", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1, ...style,
    }}>{children}</button>
  );
}

function GhostBtn({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase",
      color: "var(--holy-gold)", background: "transparent", border: "1px solid rgba(201,169,97,0.5)",
      padding: "13px 20px", width: "100%", cursor: "pointer", ...style,
    }}>{children}</button>
  );
}

// The System voice line
function SystemLine({ children, tone = "gold" }) {
  const c = tone === "crimson" ? "var(--holy-crimson-glow)" : "var(--holy-gold)";
  return (
    <div style={{ background: "rgba(20,22,30,0.72)", border: `1px solid ${tone === "crimson" ? "rgba(192,58,58,0.4)" : "rgba(201,169,97,0.35)"}`, padding: "14px 16px", boxShadow: "inset 0 0 22px rgba(201,169,97,0.06)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: c, letterSpacing: "0.22em", marginBottom: 7 }}>[ THE SYSTEM ]</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#CFC9BD", lineHeight: 1.5 }}>
        <span style={{ color: c }}>▸ </span>{children}
      </div>
    </div>
  );
}

function Chip({ children, on }) {
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", padding: "4px 9px", border: `1px solid ${on ? "rgba(201,169,97,0.45)" : "rgba(255,255,255,0.12)"}`, background: on ? "rgba(201,169,97,0.14)" : "transparent", color: on ? "var(--holy-gold)" : "#9A948A" }}>{children}</span>;
}

Object.assign(window, { TABS, TabBar, Screen, ScreenTop, Seal, StatBar, GoldBtn, GhostBtn, SystemLine, Chip, ScrollCtx });
