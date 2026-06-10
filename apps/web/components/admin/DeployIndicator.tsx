"use client";

// Vercel deploy status in the sidebar: a radial loader while building, a glowing
// LED when live (green) or failed (red). Polls every 12s; faster while building.
import { useEffect, useRef, useState } from "react";
import { MONO } from "@/lib/ui";

export function DeployIndicator() {
  const [state, setState] = useState<string>("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/admin/deploy-status", { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        const s = String(j.state ?? "unknown");
        setState(s);
        const building = ["BUILDING", "QUEUED", "INITIALIZING"].includes(s);
        timer.current = setTimeout(poll, building ? 5000 : 12000); // tighter cadence while building
      } catch {
        if (alive) timer.current = setTimeout(poll, 15000);
      }
    };
    poll();
    return () => { alive = false; if (timer.current) clearTimeout(timer.current); };
  }, []);

  const building = ["BUILDING", "QUEUED", "INITIALIZING"].includes(state);
  const ready = state === "READY";
  const failed = ["ERROR", "CANCELED"].includes(state);
  const unconfigured = state === "unconfigured";

  const color = failed ? "#C03A3A" : building ? "#C9A961" : ready ? "#7BBF7B" : "#8A847A";
  const label = unconfigured ? "DEPLOY ?" : failed ? "DEPLOY FAILED" : building ? "DEPLOYING" : ready ? "LIVE" : "—";

  return (
    <div title={`Vercel: ${state}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {building ? (
        <span className="deploy-spin" style={{ width: 12, height: 12, borderRadius: 999, border: "2px solid rgba(201,169,97,0.22)", borderTopColor: color, boxSizing: "border-box", display: "inline-block" }} />
      ) : (
        <span className={ready ? "" : ""} style={{ width: 9, height: 9, borderRadius: 999, background: color, boxShadow: `0 0 8px ${color}, 0 0 2px ${color}`, display: "inline-block" }} />
      )}
      <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em", color, fontWeight: 600 }}>{label}</span>
    </div>
  );
}
