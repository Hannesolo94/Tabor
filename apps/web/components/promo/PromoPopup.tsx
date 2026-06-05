"use client";

// First-order discount popup. Captures an email (to the waitlist table, tagged
// source 'promo-10') and reveals a discount code. The code's ENFORCEMENT (taking
// 10% off at payment) is wired later with the Peach checkout + a discount_codes
// table; for now we capture the signup and show the code.
//
// Behaviour: shows once per visitor after a short delay, never on /checkout,
// suppressed after dismiss or signup via localStorage.

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TaborSeal } from "@/components/TaborSeal";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

const PROMO_CODE = "FIRE10";
const SEEN_KEY = "tabor_promo_seen"; // dismissed or converted
const DELAY_MS = 9000;

export function PromoPopup() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  useEffect(() => {
    if (pathname?.startsWith("/checkout")) return;
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setShow(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("saving");
    if (!supabase) {
      console.error("Supabase not configured; promo signup cannot save.");
      setState("error");
      return;
    }
    const { error } = await supabase.from("waitlist").insert({ email, source: "promo-10" });
    // Duplicate email = already on the list; still reward them with the code.
    if (error && error.code !== "23505") {
      console.error("promo signup failed:", error.message);
      setState("error");
      return;
    }
    setState("done");
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!show) return null;

  return (
    <div onClick={dismiss} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.78)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(460px, 96vw)", background: "#0E0E12", border: `1px solid ${GOLD}55`, boxShadow: "0 0 60px rgba(201,169,97,0.12)", padding: "40px 32px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, display: "grid", placeItems: "center", pointerEvents: "none" }}><TaborSeal id="promo-bg" size={360} /></div>
        <button onClick={dismiss} aria-label="Close" style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: "#9A948A", fontSize: 20, cursor: "pointer" }}>✕</button>

        <div style={{ position: "relative" }}>
          <div style={{ display: "grid", placeItems: "center", marginBottom: 14 }}><TaborSeal id="promo-seal" size={56} /></div>

          {state === "done" ? (
            <>
              <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 12 }}>[ WELCOME, SON OF FIRE ]</div>
              <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 24, color: "#E8E2D5", margin: "0 0 10px" }}>Your code is ready.</h2>
              <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A", lineHeight: 1.6, margin: "0 0 18px" }}>Use this at checkout for 10% off your first order.</p>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.3em", color: GOLD, border: `1px dashed ${GOLD}88`, padding: "14px", marginBottom: 18 }}>{PROMO_CODE}</div>
              <button onClick={dismiss} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "13px 30px", cursor: "pointer" }}>Start the Climb</button>
            </>
          ) : (
            <>
              <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 12 }}>[ JOIN THE BROTHERHOOD ]</div>
              <h2 style={{ fontFamily: PIRATA, fontSize: 40, color: "#E8E2D5", margin: "0 0 6px", lineHeight: 1 }}>10% off</h2>
              <p style={{ fontFamily: BODY, fontSize: 14, color: "#B8B2A6", lineHeight: 1.6, margin: "0 auto 20px", maxWidth: 320 }}>
                Take 10% off your first order. Join the wall for drops, scripture, and the brotherhood.
              </p>
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required style={{ fontFamily: MONO, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}55`, padding: "14px 16px", textAlign: "center" }} />
                <button type="submit" disabled={state === "saving"} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "14px", cursor: "pointer" }}>
                  {state === "saving" ? "..." : "Claim 10% off"}
                </button>
              </form>
              {state === "error" && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginTop: 10 }}>Something broke. Try again.</p>}
              <button onClick={dismiss} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "#6E6A60", background: "none", border: "none", cursor: "pointer", marginTop: 14, textTransform: "uppercase" }}>No thanks, I pay full price</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
