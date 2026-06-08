"use client";

import { useState } from "react";
import { GOLD, MONO, CINZEL } from "@/lib/ui";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("saving");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "web" }) });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <section style={{ padding: "70px 24px", background: "#0C0C10", borderTop: "1px solid rgba(201,169,97,0.12)" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>[ JOIN THE BROTHERHOOD ]</div>
        <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: "clamp(24px,4vw,34px)", color: "#E8E2D5", margin: "0 0 14px" }}>Be first when the gates open.</h2>
        {state === "done" ? (
          <p style={{ fontFamily: MONO, fontSize: 13, color: GOLD, letterSpacing: "0.1em" }}>[ YOU ARE ON THE WALL. WE WILL CALL YOU UPWARD. ]</p>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email address" style={{ fontFamily: MONO, fontSize: 13, color: "#E8E2D5", background: "rgba(21,21,26,0.7)", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "14px 16px", minWidth: 240 }} />
            <button type="submit" disabled={state === "saving"} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 14, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", padding: "14px 28px", cursor: "pointer" }}>
              {state === "saving" ? "..." : "Join"}
            </button>
          </form>
        )}
        {state === "error" && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginTop: 10 }}>Something broke. Try again.</p>}
      </div>
    </section>
  );
}
