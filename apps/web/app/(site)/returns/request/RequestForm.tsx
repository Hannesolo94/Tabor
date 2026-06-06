"use client";

import { useState } from "react";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

const REASONS = [
  { v: "defect", l: "Faulty / damaged item" },
  { v: "sizing", l: "Sizing issue" },
  { v: "wrong_item", l: "Wrong item received" },
  { v: "other", l: "Other" },
];

export function RequestForm() {
  const [f, setF] = useState({ orderRef: "", email: "", reason: "defect", detail: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/returns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not submit."); setBusy(false); return; }
      setDone(true);
    } catch { setError("Something went wrong."); }
    setBusy(false);
  }

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}44`, padding: "12px 14px", width: "100%" };

  if (done) {
    return (
      <div style={{ border: `1px solid ${GOLD}33`, background: "#0E0E12", padding: "22px 20px" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.18em", marginBottom: 8 }}>[ REQUEST RECEIVED ]</div>
        <p style={{ fontFamily: BODY, fontSize: 14, color: "#C3BDB1", margin: 0, lineHeight: 1.6 }}>We have your request and will review it within 2 business days. Check your email for the next steps. Faulty items are covered under our guarantee.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <input required placeholder="Order reference (from your confirmation)" aria-label="Order reference" value={f.orderRef} onChange={(e) => setF({ ...f, orderRef: e.target.value })} style={inp} />
      <input required type="email" placeholder="Email used on the order" aria-label="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={inp} />
      <select aria-label="Reason" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} style={inp}>{REASONS.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</select>
      <textarea placeholder="Tell us what happened (and a photo helps for faulty items)" aria-label="Details" value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} rows={4} style={{ ...inp, resize: "vertical" }} />
      {error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", margin: 0 }}>{error}</p>}
      <div><button type="submit" disabled={busy} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "13px 26px", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "Submitting…" : "Submit request"}</button></div>
    </form>
  );
}
