import { getHero } from "@/lib/content-db";
import { ContentForm } from "./ContentForm";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const hero = await getHero();
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ PAGES ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Content</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 26px" }}>Edit your landing-page hero. Changes go live immediately.</p>

      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 16, color: "#E8E2D5", marginBottom: 14 }}>Home hero</div>
      <ContentForm hero={hero} />
    </div>
  );
}
