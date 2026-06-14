"use client";

// Staff invite form with inline feedback, so the admin actually sees the result
// (the old grant flow silently did nothing when the person had no account).
import { useActionState } from "react";
import { inviteStaff } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const cardTitle: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 12 };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px" };
const btnGold: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteStaff, null);
  return (
    <form action={action} className="admin-card" style={{ ...cardStyle, maxWidth: 560, marginBottom: 22 }}>
      <div style={cardTitle}>Invite staff</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input name="email" type="email" required placeholder="brother@email.com" style={{ ...inp, flex: 1 }} />
        <select name="role" style={{ ...inp, width: 140 }}><option value="admin">Admin</option><option value="moderator">Moderator</option></select>
        <button type="submit" disabled={pending} style={{ ...btnGold, opacity: pending ? 0.6 : 1 }}>{pending ? "Inviting…" : "Invite"}</button>
      </div>
      <p style={{ fontFamily: BODY, fontSize: 11.5, color: "#8A847A", margin: "10px 0 0" }}>
        If they have no account yet, one is created and a sign-in email is sent. If they already signed up, this just grants the role.
      </p>
      {state && (
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.02em", marginTop: 10, color: state.ok ? "#7BBF7B" : "#C03A3A", lineHeight: 1.5 }}>{state.message}</div>
      )}
    </form>
  );
}
