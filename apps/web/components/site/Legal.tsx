// Shared layout for policy/legal pages.
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh", padding: "60px 24px 90px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 8 }}>[ TABOR ]</div>
        <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(36px,7vw,60px)", color: "#E8E2D5", margin: "0 0 8px", lineHeight: 0.95 }}>{title}</h1>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", marginBottom: 36 }}>LAST UPDATED {updated.toUpperCase()}</div>
        {children}
      </div>
    </div>
  );
}

export function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 26 }}>
      <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 18, color: "#E8E2D5", letterSpacing: "0.02em", margin: "0 0 10px" }}>{h}</h2>
      <div style={{ fontFamily: BODY, fontSize: 14.5, color: "#B8B2A6", lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}
