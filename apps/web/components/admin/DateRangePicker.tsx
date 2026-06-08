"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const GOLD = "#c9a961";
const MONO = "var(--font-mono), monospace";
const BODY = "var(--font-inter), sans-serif";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

type Preset = { label: string; key?: string; yesterday?: boolean; thisMonth?: boolean; lastMonth?: boolean };
const PRESETS: Preset[] = [
  { label: "Today", key: "today" },
  { label: "Yesterday", yesterday: true },
  { label: "Last 7 days", key: "7d" },
  { label: "Last 30 days", key: "30d" },
  { label: "Last 90 days", key: "90d" },
  { label: "This month", thisMonth: true },
  { label: "Last month", lastMonth: true },
];

const trigger: React.CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.04em", color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}44`, borderRadius: 10, padding: "8px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 };
const popover: React.CSSProperties = { position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 50, background: "linear-gradient(160deg, rgba(28,28,36,0.96), rgba(12,12,16,0.96))", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid ${GOLD}33`, borderRadius: 16, boxShadow: "0 28px 70px -20px rgba(0,0,0,0.8)", padding: 16 };
const presetBtn: React.CSSProperties = { display: "block", width: "100%", textAlign: "left", fontFamily: BODY, fontSize: 13, color: "#C3BDB1", background: "transparent", border: 0, borderRadius: 8, padding: "8px 10px", cursor: "pointer" };
const navBtn: React.CSSProperties = { background: "transparent", border: 0, color: GOLD, fontSize: 16, cursor: "pointer", width: 20, lineHeight: 1 };
const ghostBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 11, color: "#C3BDB1", background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "8px 16px", cursor: "pointer" };
const goldBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: 0, borderRadius: 10, padding: "8px 18px", cursor: "pointer", boxShadow: "0 6px 16px -6px rgba(201,169,97,0.5)" };

function Month({ base, start, end, onPick, onPrev, onNext, showPrev, showNext }: { base: Date; start: Date | null; end: Date | null; onPick: (d: Date) => void; onPrev?: () => void; onNext?: () => void; showPrev?: boolean; showNext?: boolean }) {
  const year = base.getFullYear(), month = base.getMonth();
  const lead = new Date(year, month, 1).getDay();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => new Date(year, month, i + 1))];
  const inRange = (d: Date) => !!(start && end && d >= start && d <= end);
  const isEdge = (d: Date) => !!((start && iso(d) === iso(start)) || (end && iso(d) === iso(end)));
  return (
    <div style={{ width: 212 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        {showPrev ? <button onClick={onPrev} style={navBtn}>‹</button> : <span style={{ width: 20 }} />}
        <span style={{ fontFamily: BODY, fontSize: 13, color: "#E8E2D5" }}>{base.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
        {showNext ? <button onClick={onNext} style={navBtn}>›</button> : <span style={{ width: 20 }} />}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d} style={{ fontFamily: MONO, fontSize: 9, color: "#6A665C", textAlign: "center", padding: "3px 0" }}>{d}</div>)}
        {cells.map((d, i) => d ? (
          <button key={i} onClick={() => onPick(d)} style={{ aspectRatio: "1", border: 0, cursor: "pointer", fontFamily: MONO, fontSize: 11, borderRadius: 6, background: isEdge(d) ? GOLD : inRange(d) ? "rgba(201,169,97,0.16)" : "transparent", color: isEdge(d) ? "#1a1408" : "#C3BDB1" }}>{d.getDate()}</button>
        ) : <div key={i} />)}
      </div>
    </div>
  );
}

export function DateRangePicker({ currentLabel }: { currentLabel: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [view, setView] = useState(() => startOfMonth(addDays(new Date(), -31)));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  function pickDay(d: Date) {
    if (!start || (start && end)) { setStart(d); setEnd(null); }
    else if (d < start) { setEnd(start); setStart(d); }
    else setEnd(d);
  }
  function applyPreset(p: Preset) {
    if (p.key) { router.push(`/admin?range=${p.key}`); setOpen(false); return; }
    const now = new Date();
    let from: Date, to: Date;
    if (p.yesterday) { from = to = addDays(now, -1); }
    else if (p.thisMonth) { from = startOfMonth(now); to = now; }
    else if (p.lastMonth) { from = new Date(now.getFullYear(), now.getMonth() - 1, 1); to = new Date(now.getFullYear(), now.getMonth(), 0); }
    else return;
    router.push(`/admin?range=custom&from=${iso(from)}&to=${iso(to)}`); setOpen(false);
  }
  function apply() {
    if (!start) return;
    router.push(`/admin?range=custom&from=${iso(start)}&to=${iso(end ?? start)}`);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((o) => !o)} style={trigger}>🗓 {currentLabel} ▾</button>
      {open && (
        <div style={popover}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 148, borderRight: "1px solid rgba(255,255,255,0.08)", paddingRight: 8 }}>
              {PRESETS.map((p) => <button key={p.label} onClick={() => applyPreset(p)} style={presetBtn} onMouseDown={(e) => e.preventDefault()}>{p.label}</button>)}
            </div>
            <div>
              <div style={{ display: "flex", gap: 22 }}>
                <Month base={view} start={start} end={end} onPick={pickDay} showPrev onPrev={() => setView((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} />
                <Month base={new Date(view.getFullYear(), view.getMonth() + 1, 1)} start={start} end={end} onPick={pickDay} showNext onNext={() => setView((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: "#C3BDB1" }}>{start ? fmt(start) : "Pick a start"}{end ? ` – ${fmt(end)}` : start ? " – …" : ""}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setOpen(false)} style={ghostBtn}>Cancel</button>
                  <button onClick={apply} disabled={!start} style={{ ...goldBtn, opacity: start ? 1 : 0.5 }}>Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
