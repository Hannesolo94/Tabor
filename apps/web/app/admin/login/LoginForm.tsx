"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { LogoLockup } from "@/components/LogoLockup";
import type { BrandLogos } from "@/lib/brand";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export function LoginForm({ logo }: { logo?: BrandLogos }) {
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
      <div style={{ width: "min(400px, 95vw)", border: `1px solid ${GOLD}44`, background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderRadius: 18, boxShadow: "0 28px 70px -24px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "36px 30px" }}>
        <div style={{ marginBottom: 14 }}><LogoLockup logo={logo} iconSize={52} wordmarkHeight={62} textSize={30} idSuffix="admin-login" /></div>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.24em", marginBottom: 24 }}>ADMIN PORTAL</div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" required style={inp} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required style={inp} />
          <button type="submit" disabled={busy} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "13px", cursor: "pointer", marginTop: 4 }}>
            {busy ? "..." : "Enter"}
          </button>
        </form>
        {err && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginTop: 12, textAlign: "center" }}>{err}</p>}
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link href="/admin/setup" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>FIRST TIME? SET YOUR PASSWORD →</Link>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}44`, borderRadius: 10, padding: "13px 14px" };
