"use client";

// Live content calendar: month grid of everything scheduled (gold clock) and
// published (green dot). Data comes from the server page; the admin shell's
// AutoRefresh re-fetches it every minute, so the view stays live while open.
import { useState } from "react";
import Link from "next/link";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export interface CalItem { id: string; title: string; status: string; when: string; type: string }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ContentCalendar({ items }: { items: CalItem[] }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const byDay = new Map<string, CalItem[]>();
  for (const it of items) {
    const d = new Date(it.when);
    if (isNaN(d.getTime())) continue;
    const k = dayKey(d);
    const a = byDay.get(k) ?? [];
    a.push(it);
    byDay.set(k, a);
  }
  for (const a of byDay.values()) a.sort((x, y) => new Date(x.when).getTime() - new Date(y.when).getTime());

  const first = new Date(cursor.y, cursor.m, 1);
  const lead = (first.getDay() + 6) % 7; // week starts Monday
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.y, cursor.m, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);
  const todayKey = dayKey(now);

  const nav = (d: number) => setCursor((c) => { const m = c.m + d; return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }; });
  const navBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 13, color: GOLD, background: "rgba(201,169,97,0.08)", border: `1px solid ${GOLD}33`, borderRadius: 8, padding: "4px 12px", cursor: "pointer", lineHeight: 1 };

  return (
    <div className="admin-card" style={{ background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5" }}>Content calendar</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 12, marginRight: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 8.5, color: GOLD, letterSpacing: "0.08em" }}>🕒 SCHEDULED</span>
            <span style={{ fontFamily: MONO, fontSize: 8.5, color: "#7BBF7B", letterSpacing: "0.08em" }}>● PUBLISHED</span>
          </span>
          <button type="button" onClick={() => nav(-1)} style={navBtn}>‹</button>
          <span style={{ fontFamily: MONO, fontSize: 11, color: "#E8E2D5", letterSpacing: "0.1em", minWidth: 132, textAlign: "center" }}>{MONTHS[cursor.m].toUpperCase()} {cursor.y}</span>
          <button type="button" onClick={() => nav(1)} style={navBtn}>›</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {DOW.map((d) => (
          <div key={d} style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.12em", textAlign: "center", padding: "2px 0 6px" }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ minHeight: 74, borderRadius: 10, background: "rgba(255,255,255,0.015)" }} />;
          const k = dayKey(d);
          const dayItems = byDay.get(k) ?? [];
          const isToday = k === todayKey;
          return (
            <div key={i} style={{ minHeight: 74, borderRadius: 10, border: `1px solid ${isToday ? `${GOLD}66` : "rgba(255,255,255,0.06)"}`, background: isToday ? "rgba(201,169,97,0.06)" : "rgba(15,15,20,0.4)", padding: "5px 6px", overflow: "hidden" }}>
              <div style={{ fontFamily: MONO, fontSize: 9, color: isToday ? GOLD : "#8A847A", fontWeight: isToday ? 700 : 400, marginBottom: 3 }}>{d.getDate()}</div>
              {dayItems.slice(0, 3).map((it) => {
                const scheduled = it.status === "scheduled";
                const time = new Date(it.when).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return (
                  <Link key={it.id} href={`/admin/blog/${it.id}`} title={`${it.title} · ${time}`} style={{ display: "block", fontFamily: BODY, fontSize: 10, lineHeight: 1.25, color: scheduled ? GOLD : "#9FCB9F", textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: scheduled ? "rgba(201,169,97,0.1)" : "rgba(123,191,123,0.08)", borderRadius: 5, padding: "2px 5px", marginBottom: 3 }}>
                    {scheduled ? "🕒 " : "● "}{it.title}
                  </Link>
                );
              })}
              {dayItems.length > 3 && <div style={{ fontFamily: MONO, fontSize: 8, color: "#8A847A" }}>+{dayItems.length - 3} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
