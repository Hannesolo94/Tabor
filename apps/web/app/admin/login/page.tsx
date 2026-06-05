"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { TaborSeal } from "@/components/TaborSeal";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const sb = supabaseBrowser();
    if (!sb) {
      setErr("Auth not configured.");
      setBusy(false);
      return;
    }
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "min(400px, 95vw)", border: `1px solid ${GOLD}44`, background: "#0E0E12", padding: "36px 30px" }}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 14 }}><TaborSeal id="admin-login" size={52} /></div>
        <div style={{ textAlign: "center", fontFamily: PIRATA, fontSize: 30, color: GOLD }}>Tabor</div>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.24em", marginBottom: 24 }}>ADMIN PORTAL</div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" required style={inp} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required style={inp} />
          <button type="submit" disabled={busy} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "13px", cursor: "pointer", marginTop: 4 }}>
            {busy ? "..." : "Enter"}
          </button>
        </form>
        {err && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginTop: 12, textAlign: "center" }}>{err}</p>}
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link href="/admin/setup" style={{ fontFamily: MONO, fontSize: 10, color: "#6E6A60", letterSpacing: "0.12em", textDecoration: "none" }}>FIRST TIME? SET YOUR PASSWORD →</Link>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}44`, padding: "13px 14px" };
