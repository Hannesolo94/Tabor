"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { GOLD, MONO, CINZEL } from "@/lib/ui";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("saving");
    if (!supabase) {
      // Misconfiguration; never fake success.
      console.error("Supabase env not configured; waitlist cannot save.");
      setState("error");
      return;
    }
    const { error } = await supabase.from("waitlist").insert({ email, source: "web" });
    if (error) console.error("waitlist insert failed:", error.message);
    setState(error ? "error" : "done");
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
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ fontFamily: MONO, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}55`, padding: "13px 16px", minWidth: 240 }} />
            <button type="submit" disabled={state === "saving"} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "13px 26px", cursor: "pointer" }}>
              {state === "saving" ? "..." : "Join"}
            </button>
          </form>
        )}
        {state === "error" && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginTop: 10 }}>Something broke. Try again.</p>}
      </div>
    </section>
  );
}
