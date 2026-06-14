"use client";

import { useActionState } from "react";
import { changePassword } from "./actions";
import { MONO, CINZEL, BODY, GOLD } from "@/lib/ui";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px", maxWidth: 460 };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "10px 12px", width: "100%" };
const btnGold: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action} className="admin-card" style={cardStyle}>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 }}>Change password</div>
      <div style={{ display: "grid", gap: 12 }}>
        <div><label style={lbl}>Current password</label><input name="current" type="password" required autoComplete="current-password" style={inp} /></div>
        <div><label style={lbl}>New password</label><input name="next" type="password" required minLength={10} autoComplete="new-password" placeholder="At least 10 characters" style={inp} /></div>
        <div><label style={lbl}>Confirm new password</label><input name="confirm" type="password" required minLength={10} autoComplete="new-password" style={inp} /></div>
        <div><button type="submit" disabled={pending} style={{ ...btnGold, opacity: pending ? 0.6 : 1 }}>{pending ? "Saving…" : "Update password"}</button></div>
        {state && <div style={{ fontFamily: MONO, fontSize: 11, color: state.ok ? "#7BBF7B" : "#C03A3A", letterSpacing: "0.02em" }}>{state.message}</div>}
      </div>
    </form>
  );
}
