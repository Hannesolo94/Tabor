// Unlisted font comparison for the hero headline. Fonts are loaded via next/font so they
// self-host under our own origin (the site CSP blocks external Google Fonts). Pick the one
// that best matches the metal logo while staying legible; then it gets wired into the hero.
import { Metal_Mania, Eater, New_Rocker, Pirata_One, UnifrakturMaguntia, Grenze_Gotisch, MedievalSharp, Metamorphous } from "next/font/google";
import { GOLD, MONO, BODY } from "@/lib/ui";

export const metadata = {
  title: "Font lab",
  robots: { index: false, follow: false },
};

const metalMania = Metal_Mania({ subsets: ["latin"], weight: "400", display: "swap" });
const eater = Eater({ subsets: ["latin"], weight: "400", display: "swap" });
const newRocker = New_Rocker({ subsets: ["latin"], weight: "400", display: "swap" });
const pirata = Pirata_One({ subsets: ["latin"], weight: "400", display: "swap" });
const unifraktur = UnifrakturMaguntia({ subsets: ["latin"], weight: "400", display: "swap" });
const grenze = Grenze_Gotisch({ subsets: ["latin"], weight: ["400", "700", "900"], display: "swap" });
const medieval = MedievalSharp({ subsets: ["latin"], weight: "400", display: "swap" });
const metamorphous = Metamorphous({ subsets: ["latin"], weight: "400", display: "swap" });

// Ordered most-metal/spiky -> most-legible.
const FONTS: { name: string; family: string; metal: number; legible: number; note: string }[] = [
  { name: "Metal Mania", family: metalMania.style.fontFamily, metal: 5, legible: 2, note: "Closest to the logo. Spiky band-logo look. Hardest to read." },
  { name: "Eater", family: eater.style.fontFamily, metal: 5, legible: 2, note: "Dripping horror-metal. Very on-theme, low legibility." },
  { name: "New Rocker", family: newRocker.style.fontFamily, metal: 4, legible: 3, note: "Metal-rock blackletter. Good balance of edge and readability." },
  { name: "Pirata One (current)", family: pirata.style.fontFamily, metal: 3, legible: 4, note: "What the site uses now. Blackletter, clean, less aggressive." },
  { name: "UnifrakturMaguntia", family: unifraktur.style.fontFamily, metal: 3, legible: 3, note: "Ornate medieval blackletter. Heavy, traditional." },
  { name: "Grenze Gotisch", family: grenze.style.fontFamily, metal: 3, legible: 5, note: "Modern blackletter. Sharp but very readable. Strong middle ground." },
  { name: "MedievalSharp", family: medieval.style.fontFamily, metal: 2, legible: 5, note: "Sharp medieval, highly legible. Less metal, more knightly." },
  { name: "Metamorphous", family: metamorphous.style.fontFamily, metal: 2, legible: 5, note: "Light medieval display. The most legible, least metal." },
];

function Rating({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.08em" }}>
      {label} <span style={{ color }}>{"●".repeat(score)}</span><span style={{ color: "#3a3a3a" }}>{"●".repeat(5 - score)}</span>
    </span>
  );
}

export default function FontLab() {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", padding: "48px 24px 90px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 8 }}>[ FONT LAB · UNLISTED ]</div>
        <h1 style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: "0 0 6px" }}>Hero headline font options</h1>
        <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A", margin: "0 0 36px", lineHeight: 1.6, maxWidth: 620 }}>
          Each block shows the live hero headline. Ordered most-metal at the top to most-legible at the bottom. Tell me which one and I will wire it into the real site.
        </p>

        <div style={{ display: "grid", gap: 18 }}>
          {FONTS.map((f) => (
            <div key={f.name} style={{ border: "1px solid rgba(201,169,97,0.16)", borderRadius: 16, background: "linear-gradient(160deg, rgba(22,22,28,0.6), rgba(12,12,16,0.6))", padding: "22px 26px", overflow: "hidden" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 10 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD, letterSpacing: "0.1em" }}>{f.name}</span>
                <Rating label="metal" score={f.metal} color={GOLD} />
                <Rating label="legible" score={f.legible} color="#7BBF7B" />
              </div>
              <div style={{ fontFamily: f.family, fontSize: "clamp(44px, 8vw, 96px)", color: "#E8E2D5", lineHeight: 0.95, margin: "4px 0 6px" }}>Wear the Climb</div>
              <div style={{ fontFamily: f.family, fontSize: "clamp(24px, 4vw, 40px)", color: GOLD, lineHeight: 1, marginBottom: 12, letterSpacing: "0.04em" }}>TABOR</div>
              <p style={{ fontFamily: BODY, fontSize: 13, color: "#8A847A", margin: 0 }}>{f.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
