import Link from "next/link";
import { TaborSeal } from "@/components/TaborSeal";
import { GOLD, MONO, PIRATA, CINZEL, BODY, SCRIPTURE, IVORY, MUTED, LINE } from "@/lib/ui";

export const metadata = {
  title: "About · TABOR",
  description: "TABOR is a brotherhood for Christian men who game, train, and want daily scripture with real accountability. Sons of Fire. Forged not bought.",
};

const PILLARS = [
  { name: "Scripture Raid", body: "Daily time in the Word, run like a quest. Open the passage, sit with it, and seal the day. Not a checkbox. A discipline." },
  { name: "Fitness Guild", body: "Train the body you were given. Logged workouts, real programs, and brothers who notice when you go quiet." },
  { name: "Brotherhood", body: "No man holds the line alone. Guilds, accountability, and a board that calls you up, not out." },
];

export default function About() {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh" }}>
      {/* Hero */}
      <section style={{ padding: "72px 24px 56px", textAlign: "center", borderBottom: `1px solid ${LINE}` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <TaborSeal id="about-seal" size={72} />
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.28em", marginBottom: 14 }}>[ SONS OF FIRE ]</div>
        <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(44px,9vw,84px)", color: IVORY, margin: "0 0 18px", lineHeight: 0.92 }}>About TABOR</h1>
        <p style={{ fontFamily: SCRIPTURE, fontSize: "clamp(18px,3vw,24px)", color: "#B8B2A6", maxWidth: 640, margin: "0 auto", lineHeight: 1.5, fontStyle: "italic" }}>
          A brotherhood for men who refuse to drift. We game, we train, we keep the faith. Together.
        </p>
      </section>

      {/* Body */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 80px" }}>
        <Section h="Why we exist">
          Too many men are alone in the fight. Strong online, scattered in real life. They scroll past scripture, skip the gym, and carry it all in silence. TABOR was built to end that. We took the loops that already hold a man's attention, the quests, the ranks, the guilds, and pointed them at the things that actually forge him: the Word, the body, and the brothers beside him.
        </Section>

        <Section h="What TABOR is">
          A free-for-life app for Christian men who want daily scripture and real accountability, wrapped in a daily quest loop and guided by a voice we call the System. It speaks plain and it speaks straight. Three pillars carry the whole thing.
        </Section>

        {/* Pillars */}
        <div style={{ display: "grid", gap: 16, margin: "8px 0 34px" }}>
          {PILLARS.map((p) => (
            <div key={p.name} style={{ border: `1px solid ${LINE}`, borderRadius: 12, padding: "20px 22px", background: "#0E0E12" }}>
              <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 17, color: GOLD, letterSpacing: "0.02em", marginBottom: 7 }}>{p.name}</div>
              <div style={{ fontFamily: BODY, fontSize: 14.5, color: "#B8B2A6", lineHeight: 1.7 }}>{p.body}</div>
            </div>
          ))}
        </div>

        <Section h="The standard">
          We do not chase clout and we do not sell easy. Everything here is made to be earned. Ranks are climbed, not bought. The gear is forged, not branded onto you. That is the line: forged not bought. If a man wants comfort, there are easier rooms. If he wants to be sharpened, he has a home here.
        </Section>

        <Section h="Open hearts welcome">
          You do not have to arrive certain. Believers and honest seekers both belong. The door is wide for any man willing to learn, and the Word does the rest.
        </Section>

        <Section h="The gear">
          Our apparel carries the same fire as the app. Engraved, Orthodox in spirit, built for men who wear what they stand for. Every order is made to order and fulfilled locally and worldwide. Wearing the mark is its own kind of confession.
        </Section>
      </div>

      {/* CTA */}
      <section style={{ borderTop: `1px solid ${LINE}`, padding: "54px 24px 64px", textAlign: "center", background: "#0E0E12" }}>
        <div style={{ fontFamily: PIRATA, fontSize: "clamp(28px,5vw,40px)", color: IVORY, marginBottom: 8 }}>Take up the cross.</div>
        <p style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: "0.16em", marginBottom: 26 }}>NO MAN HOLDS THE LINE ALONE.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/#app" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", color: "#0A0A0A", background: GOLD, padding: "13px 26px", borderRadius: 8, textDecoration: "none", textTransform: "uppercase", fontWeight: 700 }}>Get The App</Link>
          <Link href="/shop" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", color: GOLD, border: `1px solid ${GOLD}`, padding: "13px 26px", borderRadius: 8, textDecoration: "none", textTransform: "uppercase" }}>Shop The Gear</Link>
        </div>
      </section>
    </div>
  );
}

function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 19, color: IVORY, letterSpacing: "0.02em", margin: "0 0 11px" }}>{h}</h2>
      <div style={{ fontFamily: BODY, fontSize: 14.5, color: "#B8B2A6", lineHeight: 1.78 }}>{children}</div>
    </section>
  );
}
