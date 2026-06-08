// Branded landing after a user confirms their email from the Supabase auth email.
// Supabase redirects here (Site URL / emailRedirectTo). Purely informational —
// the email is already confirmed server-side by the time this loads.
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export const metadata = { title: "Email Confirmed", robots: { index: false } };

export default function Confirmed() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, width: "100%", background: "#0E0E12", border: "1px solid rgba(201,169,97,0.28)", textAlign: "center" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg,#A8843E,#E8D08C,#A8843E)" }} />
        <div style={{ padding: "44px 30px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.3em", color: GOLD }}>&#10013;</div>
          <div style={{ fontFamily: PIRATA, fontSize: 56, color: "#E8E2D5", lineHeight: 1, margin: "10px 0 4px" }}>Tabor</div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.3em", color: "#8A847A" }}>SONS OF FIRE</div>

          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", color: GOLD, margin: "34px 0 10px" }}>[ CONFIRMED ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: "0 0 12px" }}>You're in, brother.</h1>
          <p style={{ fontFamily: BODY, fontSize: 15.5, color: "#C3BDB1", lineHeight: 1.65, margin: 0 }}>
            Your email is confirmed and your account is sealed. Open the <strong style={{ color: "#E8E2D5" }}>TABOR</strong> app on your phone and sign in. The climb begins.
          </p>

          <div style={{ marginTop: 30, paddingTop: 22, borderTop: "1px solid rgba(201,169,97,0.16)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: GOLD }}>FORGED NOT BOUGHT</div>
            <a href="https://tabor.quest" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>tabor.quest</a>
          </div>
        </div>
      </div>
    </div>
  );
}
