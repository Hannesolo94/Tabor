"use client";

import { useState } from "react";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

interface Charity { id: string; name: string }

export function DonateForm({ charities, goalId }: { charities: Charity[]; goalId: string | null }) {
  const [f, setF] = useState({ name: "", email: "", amount: "", charity_id: charities[0]?.id ?? "", message: "", anonymous: false });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const amounts = [50, 150, 300, 500];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/donate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, amount: Number(f.amount), goal_id: goalId }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not submit."); setBusy(false); return; }
      setDone(true);
    } catch { setError("Something went wrong."); }
    setBusy(false);
  }

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}44`, padding: "12px 14px", width: "100%" };

  if (done) return (
    <div style={{ border: `1px solid ${GOLD}55`, background: "#0E0E12", padding: "26px 22px", textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.2em" }}>[ THANK YOU ]</div>
      <p style={{ fontFamily: BODY, fontSize: 15, color: "#C3BDB1", lineHeight: 1.6, marginTop: 10 }}>Your pledge is recorded, brother. We will email you a secure payment link shortly to complete it. Iron sharpens iron.</p>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {amounts.map((a) => (
          <button type="button" key={a} onClick={() => setF({ ...f, amount: String(a) })} style={{ fontFamily: MONO, fontSize: 13, color: f.amount === String(a) ? "#0A0A0A" : GOLD, background: f.amount === String(a) ? GOLD : "transparent", border: `1px solid ${GOLD}55`, padding: "10px 16px", cursor: "pointer" }}>R{a}</button>
        ))}
        <input value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^0-9]/g, "") })} placeholder="Other (R)" inputMode="numeric" style={{ ...inp, width: 120 }} />
      </div>
      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name (for the donor wall)" style={inp} />
      <input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" style={inp} />
      {charities.length > 0 && (
        <select value={f.charity_id} onChange={(e) => setF({ ...f, charity_id: e.target.value })} style={inp}>
          <option value="">Where should your half go? (choose a charity)</option>
          {charities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      <input value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="A word for the brotherhood (optional)" style={inp} />
      <label style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", display: "flex", gap: 8, alignItems: "center" }}>
        <input type="checkbox" checked={f.anonymous} onChange={(e) => setF({ ...f, anonymous: e.target.checked })} /> Give anonymously
      </label>
      {error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A" }}>{error}</p>}
      <button type="submit" disabled={busy} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "15px", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "..." : "Pledge your support"}</button>
      <p style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.06em", textAlign: "center" }}>SECURE PAYMENT LINK SENT BY EMAIL · CARD PAYMENTS LIVE SOON</p>
    </form>
  );
}
