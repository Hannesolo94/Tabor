"use client";

import { useActionState } from "react";
import Link from "next/link";
import { setupAdminPassword, type SetupState } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

const initial: SetupState = { ok: false };

export function SetupForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(setupAdminPassword, initial);

  if (state.ok) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.2em", marginBottom: 10 }}>[ PASSWORD SET ]</div>
        <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A", marginBottom: 18 }}>Your admin password is set. You can log in now.</p>
        <Link href="/admin/login" style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, padding: "13px 26px", textDecoration: "none", display: "inline-block" }}>Go to Login</Link>
      </div>
    );
  }

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.12em", textAlign: "center", marginBottom: 4 }}>{email.toUpperCase()}</div>
      <input name="password" type="password" placeholder="new password (min 10 chars)" required minLength={10} style={inp} />
      <input name="confirm" type="password" placeholder="confirm password" required minLength={10} style={inp} />
      <button type="submit" disabled={pending} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "13px", cursor: "pointer", marginTop: 4 }}>
        {pending ? "..." : "Set Password"}
      </button>
      {state.error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", textAlign: "center" }}>{state.error}</p>}
    </form>
  );
}

const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}44`, padding: "13px 14px" };
