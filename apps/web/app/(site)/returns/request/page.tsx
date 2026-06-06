import { RequestForm } from "./RequestForm";
import { GOLD, MONO, PIRATA, BODY } from "@/lib/ui";

export const metadata = { title: "Request a Return", description: "Start a return or report a faulty item." };

export default function ReturnRequestPage() {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh", padding: "60px 24px 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 10 }}>[ RETURNS ]</div>
        <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(36px,7vw,60px)", color: "#E8E2D5", margin: "0 0 14px" }}>Request a Return</h1>
        <p style={{ fontFamily: BODY, fontSize: 15, color: "#9A948A", maxWidth: 560, lineHeight: 1.6, marginBottom: 28 }}>Faulty or damaged items are covered free under our guarantee. For sizing, see our size guide first; store credit may apply. Submit the form and we will guide you from there.</p>
        <RequestForm />
      </div>
    </div>
  );
}
