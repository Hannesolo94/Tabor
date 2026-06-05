// apparel-app.jsx — TABOR first drop lookbook (reuses GLSection/Body from gl-logo.jsx)
function Swatch({ c, label }) { return <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 14, background: c, border: "1px solid rgba(255,255,255,0.1)" }} /><span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#9A948A", letterSpacing: "0.08em" }}>{label}</span></div>; }

function Garment({ tone, ink, mark, caption, name, fabric, placement, ways }) {
  return (
    <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12" }}>
      <div style={{ position: "relative", aspectRatio: "4/5", background: tone, overflow: "hidden", display: "grid", placeItems: "center", borderBottom: "1px solid rgba(201,169,97,0.18)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 11px, transparent 11px 22px)" }} />
        <div style={{ position: "relative", textAlign: "center" }}>
          {mark === "seal" ? <TaborIconSeal id={"ap-" + name.replace(/\s/g, "")} size={92} />
            : <div style={{ fontFamily: "'Pirata One', serif", fontSize: 44, color: ink }}>Tabor</div>}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: ink, opacity: 0.7, letterSpacing: "0.18em", marginTop: 10 }}>{caption}</div>
        </div>
      </div>
      <div style={{ padding: "14px 15px" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "var(--holy-ivory)" }}>{name}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.1em", marginTop: 3 }}>{fabric}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A", marginTop: 8, lineHeight: 1.5 }}>{placement}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>{ways.map(([c, l], i) => <Swatch key={i} c={c} label={l} />)}</div>
      </div>
    </div>
  );
}

function ApparelApp() {
  const G = [
    { tone: "#15151A", ink: "#E8E2D5", mark: "word", caption: "BACK PRINT · SEAL AT CHEST", name: "Sons of Fire Tee", fabric: "240GSM HEAVYWEIGHT COTTON", placement: "Blackletter wordmark across the back, mountain seal at left chest. Boxy, drop-shoulder fit.", ways: [["#15151A", "MATTE BLACK"], ["#E8E2D5", "BONE"]] },
    { tone: "#121216", ink: "#C9A961", mark: "seal", caption: "TONAL SEAL · GOLD CUFF", name: "Ascent Hoodie", fabric: "PREMIUM BRUSHED-BACK FLEECE", placement: "Tonal seal embroidery at chest, gold inscription at the cuff. Heavy, structured hood.", ways: [["#121216", "MATTE BLACK"], ["#2A1414", "OXBLOOD"]] },
    { tone: "#131318", ink: "#E8E2D5", mark: "seal", caption: "CHEST SEAL · NAPE TEXT", name: "Tempered Crewneck", fabric: "MIDWEIGHT LOOPBACK COTTON", placement: "Minimal seal at chest, Sons of Fire woven at the nape. Clean, premium.", ways: [["#131318", "MATTE BLACK"], ["#E8E2D5", "BONE"]] },
    { tone: "#17140E", ink: "#C9A961", mark: "seal", caption: "FRONT SEAL · GOLD THREAD", name: "Seal Cap", fabric: "STRUCTURED 6-PANEL", placement: "Forged mountain seal in metallic gold thread, front and center.", ways: [["#17140E", "MATTE BLACK"]] },
    { tone: "#14140F", ink: "#C9A961", mark: "seal", caption: "CUFF SEAL", name: "Cuffed Beanie", fabric: "RIBBED MERINO BLEND", placement: "Folded cuff, gold-thread seal. Cold-dawn essential.", ways: [["#14140F", "MATTE BLACK"], ["#D4CCB8", "BONE"]] },
    { tone: "#15151A", ink: "#C9A961", mark: "word", caption: "TRAINING KIT", name: "The Arsenal", fabric: "JOGGERS · SHAKER · STRAPS · PATCHES", placement: "Tapered joggers, steel shaker, lifting straps, woven patch + sticker pack.", ways: [["#15151A", "MATTE BLACK"], ["#C9A961", "GOLD"]] },
  ];
  return (
    <div style={{ background: "#0A0A0A" }}>
      <section style={{ minHeight: "64vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "70px 24px", borderBottom: "1px solid rgba(201,169,97,0.14)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,169,97,0.08), transparent 70%)" }} />
        <div style={{ position: "relative", fontFamily: "'Pirata One', serif", fontSize: 64, color: "var(--holy-gold)" }}>Tabor</div>
        <div className="holy-system" style={{ color: "var(--holy-gold)", letterSpacing: "0.3em", marginTop: 14 }}>[ APPAREL · THE FIRST DROP ]</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 30, color: "var(--holy-ivory)", letterSpacing: "0.08em", margin: "10px 0 0", position: "relative" }}>WEAR THE CLIMB</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#9A948A", maxWidth: 540, marginTop: 12, lineHeight: 1.6, position: "relative" }}>Sacred-tactical streetwear. Heavyweight, muted, premium restraint. These are mockup specs and placement — real photography drops once samples exist.</p>
      </section>

      <GLSection n="01" kicker="Palette" title="Garment Colorways" first>
        <Body>Four grounds. Matte black is the base; bone is the contrast; gold and crimson are accents only.</Body>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[["#0F0F12", "Matte Black"], ["#E8E2D5", "Bone"], ["#C9A961", "Byzantine Gold"], ["#2A1414", "Oxblood / Crimson"]].map(([c, l]) => (
            <div key={l} style={{ textAlign: "center" }}><div style={{ width: 76, height: 76, background: c, border: "1px solid rgba(201,169,97,0.25)" }} /><div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#9A948A", letterSpacing: "0.1em", marginTop: 6 }}>{l.toUpperCase()}</div></div>
          ))}
        </div>
      </GLSection>

      <GLSection n="02" kicker="The Line" title="First Drop">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>{G.map((g, i) => <Garment key={i} {...g} />)}</div>
      </GLSection>

      <GLSection n="03" kicker="Craft" title="Print & Trims">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[["Wordmark", "Heavyweight screenprint, soft-hand. Bone or gold on black; black on bone."], ["The Seal", "Tonal embroidery or metallic-gold thread. Never printed cheap; it carries the brand."], ["Labels", "Woven neck label with the seal. Gold-foil hangtag carrying the creed."], ["Rule", "Authentic restraint. No fake distress, no loud graphics. The mark earns its place."]].map(([t, d], i) => (
            <div key={i} style={{ border: "1px solid rgba(201,169,97,0.2)", background: "#0E0E12", padding: "16px" }}><div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 15, color: "var(--holy-gold)" }}>{t}</div><div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "#9A948A", marginTop: 6, lineHeight: 1.5 }}>{d}</div></div>
          ))}
        </div>
      </GLSection>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "30px 28px 70px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 26, color: "var(--holy-gold)" }}>Sons of Fire</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#6E6A60", letterSpacing: "0.16em", marginTop: 8 }}>TABOR APPAREL · FIRST DROP · MOCKUP LOOKBOOK</div>
      </section>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<ApparelApp />);
