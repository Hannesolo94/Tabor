"use client";

// One-click customer delete with a confirmation modal (so nothing is wiped by
// accident). Requires typing/confirming before the destructive action fires.
import { useState } from "react";
import { deleteCustomer } from "./actions";
import { MONO, BODY, CINZEL } from "@/lib/ui";

export function DeleteCustomer({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const CRIMSON = "#C03A3A";
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: CRIMSON, background: "rgba(192,58,58,0.06)", border: `1px solid ${CRIMSON}66`, borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>
        Delete all data
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.78)", display: "grid", placeItems: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 95vw)", background: "linear-gradient(160deg, rgba(32,32,40,0.85), rgba(14,14,19,0.82))", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: `1px solid ${CRIMSON}55`, borderRadius: 18, boxShadow: "0 28px 70px -24px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "28px 26px" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: CRIMSON, letterSpacing: "0.2em", marginBottom: 10 }}>[ PERMANENT DELETE ]</div>
            <h3 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 20, color: "#E8E2D5", margin: "0 0 12px" }}>Erase this customer?</h3>
            <p style={{ fontFamily: BODY, fontSize: 13.5, color: "#9A948A", lineHeight: 1.6, margin: "0 0 8px" }}>
              This permanently deletes <strong style={{ color: "#C3BDB1" }}>{email}</strong> and everything we hold for them: signup, notes, account, and profile. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button onClick={() => setOpen(false)} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C3BDB1", background: "rgba(201,169,97,0.05)", border: "1px solid rgba(201,169,97,0.3)", borderRadius: 12, padding: "11px 18px", cursor: "pointer" }}>Cancel</button>
              <form action={deleteCustomer}>
                <input type="hidden" name="email" value={email} />
                <button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", background: CRIMSON, border: "none", borderRadius: 12, boxShadow: "0 6px 18px -6px rgba(192,58,58,0.6), inset 0 1px 0 rgba(255,255,255,0.2)", padding: "11px 18px", cursor: "pointer" }}>Yes, erase permanently</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
