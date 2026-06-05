import Link from "next/link";
import { isSetupDone } from "./actions";
import { SetupForm } from "./SetupForm";
import { TaborSeal } from "@/components/TaborSeal";
import { GOLD, MONO, PIRATA, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const done = await isSetupDone();
  const email = process.env.ADMIN_EMAIL ?? "";

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "min(400px, 95vw)", border: `1px solid ${GOLD}44`, background: "#0E0E12", padding: "36px 30px" }}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 14 }}><TaborSeal id="admin-setup" size={52} /></div>
        <div style={{ textAlign: "center", fontFamily: PIRATA, fontSize: 30, color: GOLD }}>Tabor</div>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.24em", marginBottom: 24 }}>FIRST-RUN SETUP</div>

        {done ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A", marginBottom: 18 }}>Setup is already complete.</p>
            <Link href="/admin/login" style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.12em", textDecoration: "none" }}>GO TO LOGIN →</Link>
          </div>
        ) : (
          <SetupForm email={email} />
        )}
      </div>
    </div>
  );
}
