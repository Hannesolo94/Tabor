"use client";

// Live IG/TikTok publishing badge: radial loader while "publishing", green when live,
// red on failure. Polls Zernio (via our route) until the post resolves, then stops.
import { useEffect, useRef, useState } from "react";
import { MONO } from "@/lib/ui";

const PUBLISHING = new Set(["publishing", "processing", "pending", "queued", "scheduled", "loading"]);
const FAILED = new Set(["failed", "error"]);

export function SocialBadge({ postId }: { postId: string }) {
  const [state, setState] = useState("loading");
  const [plats, setPlats] = useState<{ platform: string; status: string }[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/admin/social-status?id=${postId}`, { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        setState(String(j.state ?? "unknown")); setPlats(j.platforms ?? []);
        const s = String(j.state ?? "").toLowerCase();
        const plist = (j.platforms ?? []) as { status: string }[];
        const stillGoing = PUBLISHING.has(s) || plist.some((p) => PUBLISHING.has(String(p.status).toLowerCase()));
        if (j.state !== "none" && stillGoing) timer.current = setTimeout(poll, 7000);
      } catch { if (alive) timer.current = setTimeout(poll, 12000); }
    };
    poll();
    return () => { alive = false; if (timer.current) clearTimeout(timer.current); };
  }, [postId]);

  if (state === "none" || state === "loading" || state === "unknown") return null;
  const s = state.toLowerCase();
  const failed = FAILED.has(s) || plats.some((p) => FAILED.has(String(p.status).toLowerCase()));
  const publishing = !failed && (PUBLISHING.has(s) || plats.some((p) => PUBLISHING.has(String(p.status).toLowerCase())));
  const color = failed ? "#C03A3A" : publishing ? "#5B9BD5" : "#7BBF7B";
  const label = failed ? "SOCIAL FAILED" : publishing ? "PUBLISHING" : "SOCIAL LIVE";
  const tip = plats.map((p) => `${p.platform}: ${p.status}`).join(" · ") || state;

  return (
    <span title={tip} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {publishing
        ? <span className="deploy-spin" style={{ width: 11, height: 11, borderRadius: 999, border: "2px solid rgba(91,155,213,0.25)", borderTopColor: color, boxSizing: "border-box", display: "inline-block" }} />
        : <span style={{ width: 8, height: 8, borderRadius: 999, background: color, boxShadow: `0 0 7px ${color}`, display: "inline-block" }} />}
      <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em", color, fontWeight: 600 }}>{label}</span>
    </span>
  );
}
