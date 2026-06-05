"use client";

// Verse of the day. Floating panel on the right, under the header. Minimizable to
// a small tab, or closable for the day. The verse is chosen deterministically by
// the calendar day, so it changes once daily and everyone sees the same one.
import { useEffect, useState } from "react";
import { VERSES } from "@/lib/verses";
import { TaborSeal } from "@/components/TaborSeal";
import { GOLD, MONO, SCRIPTURE } from "@/lib/ui";

type State = "open" | "min" | "closed";
const KEY = "tabor_verse_v1";

export function VersesPopup() {
  const [state, setState] = useState<State>("closed"); // start hidden until mounted (avoids SSR mismatch)
  const [verse, setVerse] = useState<{ ref: string; text: string } | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dayIndex = Math.floor(new Date(today + "T00:00:00Z").getTime() / 86400000);
    setVerse(VERSES[dayIndex % VERSES.length]!);

    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { day: string; state: State };
        if (saved.day === today) {
          setState(saved.state);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setState("open");
  }, []);

  function set(next: State) {
    setState(next);
    try {
      localStorage.setItem(KEY, JSON.stringify({ day: new Date().toISOString().slice(0, 10), state: next }));
    } catch {
      /* ignore */
    }
  }

  if (!verse || state === "closed") return null;

  if (state === "min") {
    return (
      <button
        onClick={() => set("open")}
        aria-label="Open verse of the day"
        style={{ position: "fixed", right: 0, top: 150, zIndex: 150, display: "flex", alignItems: "center", gap: 8, background: "#0E0E12", border: `1px solid ${GOLD}55`, borderRight: "none", padding: "10px 12px", cursor: "pointer", writingMode: "vertical-rl" as React.CSSProperties["writingMode"] }}
      >
        <TaborSeal id="verse-min" size={18} />
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase" }}>Verse of the Day</span>
      </button>
    );
  }

  return (
    <div style={{ position: "fixed", right: 16, top: 130, zIndex: 150, width: "min(280px, calc(100vw - 32px))", background: "rgba(14,14,18,0.96)", border: `1px solid ${GOLD}55`, boxShadow: "0 0 40px rgba(201,169,97,0.1)", backdropFilter: "blur(8px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px 8px 12px", borderBottom: `1px solid ${GOLD}22` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TaborSeal id="verse-hd" size={18} />
          <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase" }}>Verse of the Day</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => set("min")} aria-label="Minimize" style={btn}>—</button>
          <button onClick={() => set("closed")} aria-label="Close" style={btn}>✕</button>
        </div>
      </div>
      <div style={{ padding: "16px 16px 18px" }}>
        <p style={{ fontFamily: SCRIPTURE, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: "#E8E2D5", margin: 0 }}>&ldquo;{verse.text}&rdquo;</p>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: GOLD, marginTop: 12, textTransform: "uppercase" }}>{verse.ref}</div>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { background: "none", border: "none", color: "#9A948A", fontSize: 13, cursor: "pointer", width: 22, height: 22, lineHeight: 1 };
