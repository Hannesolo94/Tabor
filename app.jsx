// app.jsx — Main composition for HOLY Sprint 1 design canvas

const { useState } = React;

// Wraps a logo mark in a black/grit-textured frame + foot label
function LogoCard({ direction, world, children, dark = true, footTag }) {
  return (
    <div className={dark ? "lg-frame holy-grit" : "lg-frame"}
         style={{
           background: dark ? "#0A0A0A" : "#E8E2D5",
           color: dark ? "var(--holy-ivory)" : "#2A1F10",
         }}>
      <div className="lg-stage">
        {children}
      </div>
      <div className="lg-foot" style={{
        borderTop: dark
          ? "1px solid rgba(232,226,213,0.08)"
          : "1px solid rgba(42,31,16,0.18)",
        color: dark ? "var(--holy-ivory-muted)" : "rgba(42,31,16,0.6)",
      }}>
        <span>{direction}</span>
        <span className="lg-tag">{world}</span>
      </div>
      {/* faint corner tick */}
      <span style={{
        position:"absolute", top:8, left:10,
        fontFamily:"var(--font-mono)", fontSize:8,
        letterSpacing:"0.22em",
        color: dark ? "rgba(232,226,213,0.4)" : "rgba(42,31,16,0.5)",
      }}>{footTag}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function App() {
  return (
    <DesignCanvas>
      {/* ── INTRO POSTIT ── */}
      <DCPostIt top={40} left={60} width={260} rotate={-2}>
        <strong>HOLY · Sprint 1</strong>
        <br/>Visual identity exploration.
        <br/>Logos · App icon · Color · Type · Patterns.
        <br/><br/>
        Each name has 4 directions: Sacred, Streetwear, System-Tech, Mark.
        Use the canvas to pan/zoom and click any artboard to focus.
      </DCPostIt>

      {/* ─────────── LOGOS ─────────── */}
      <DCSection id="holy" title="01 · HOLY" subtitle="Direct tie to HolyStreetwear · two-syllable confidence">
        <DCArtboard id="holy-sacred"  label="A · Sacred"    width={360} height={460}>
          <LogoCard direction="A · Sacred"     world="SACRED · BYZANTINE" footTag="HLY.01">
            <HOLY_Sacred/>
          </LogoCard>
        </DCArtboard>
        <DCArtboard id="holy-street"  label="B · Streetwear" width={360} height={460}>
          <LogoCard direction="B · Streetwear" world="STREETWEAR · IND."  footTag="HLY.02">
            <HOLY_Street/>
          </LogoCard>
        </DCArtboard>
        <DCArtboard id="holy-system"  label="C · System"    width={360} height={460}>
          <LogoCard direction="C · System"     world="TACTICAL · SYSTEM"  footTag="HLY.03">
            <HOLY_System/>
          </LogoCard>
        </DCArtboard>
        <DCArtboard id="holy-mark"    label="D · Mark"      width={360} height={460}>
          <LogoCard direction="D · Symbol-only" world="HYBRID · ICON-MARK" footTag="HLY.04">
            <HOLY_Mark/>
          </LogoCard>
        </DCArtboard>
      </DCSection>

      <DCSection id="tabor" title="02 · TABOR" subtitle="Mount of the Transfiguration · mysterious, biblical">
        <DCArtboard id="tabor-sacred" label="A · Sacred"     width={360} height={460}>
          <LogoCard direction="A · Sacred"     world="SACRED · BYZANTINE" footTag="TBR.01"><TABOR_Sacred/></LogoCard>
        </DCArtboard>
        <DCArtboard id="tabor-street" label="B · Streetwear" width={360} height={460}>
          <LogoCard direction="B · Streetwear" world="STREETWEAR · IND."  footTag="TBR.02"><TABOR_Street/></LogoCard>
        </DCArtboard>
        <DCArtboard id="tabor-system" label="C · System"     width={360} height={460}>
          <LogoCard direction="C · System"     world="TACTICAL · SYSTEM"  footTag="TBR.03"><TABOR_System/></LogoCard>
        </DCArtboard>
        <DCArtboard id="tabor-mark"   label="D · Mark"       width={360} height={460}>
          <LogoCard direction="D · Symbol-only" world="HYBRID · ICON-MARK" footTag="TBR.04"><TABOR_Mark/></LogoCard>
        </DCArtboard>
      </DCSection>

      <DCSection id="theosis" title="03 · THEOSIS" subtitle="Orthodox doctrine of becoming like God · deep, distinct">
        <DCArtboard id="theosis-sacred" label="A · Sacred"     width={360} height={460}>
          <LogoCard direction="A · Sacred"     world="SACRED · BYZANTINE" footTag="THS.01"><THEOSIS_Sacred/></LogoCard>
        </DCArtboard>
        <DCArtboard id="theosis-street" label="B · Streetwear" width={360} height={460}>
          <LogoCard direction="B · Streetwear" world="STREETWEAR · IND."  footTag="THS.02"><THEOSIS_Street/></LogoCard>
        </DCArtboard>
        <DCArtboard id="theosis-system" label="C · System"     width={360} height={460}>
          <LogoCard direction="C · System"     world="TACTICAL · SYSTEM"  footTag="THS.03"><THEOSIS_System/></LogoCard>
        </DCArtboard>
        <DCArtboard id="theosis-mark"   label="D · Mark"       width={360} height={460}>
          <LogoCard direction="D · Symbol-only" world="HYBRID · ICON-MARK" footTag="THS.04"><THEOSIS_Mark/></LogoCard>
        </DCArtboard>
      </DCSection>

      <DCSection id="imago" title="04 · IMAGO" subtitle="Imago Dei · philosophical, premium">
        <DCArtboard id="imago-sacred" label="A · Sacred"     width={360} height={460}>
          <LogoCard direction="A · Sacred"     world="SACRED · BYZANTINE" footTag="IMG.01"><IMAGO_Sacred/></LogoCard>
        </DCArtboard>
        <DCArtboard id="imago-street" label="B · Streetwear" width={360} height={460}>
          <LogoCard direction="B · Streetwear" world="STREETWEAR · IND."  footTag="IMG.02"><IMAGO_Street/></LogoCard>
        </DCArtboard>
        <DCArtboard id="imago-system" label="C · System"     width={360} height={460}>
          <LogoCard direction="C · System"     world="TACTICAL · SYSTEM"  footTag="IMG.03"><IMAGO_System/></LogoCard>
        </DCArtboard>
        <DCArtboard id="imago-mark"   label="D · Mark"       width={360} height={460}>
          <LogoCard direction="D · Symbol-only" world="HYBRID · ICON-MARK" footTag="IMG.04"><IMAGO_Mark/></LogoCard>
        </DCArtboard>
      </DCSection>

      {/* ─────────── APP ICONS ─────────── */}
      <DCSection id="icons" title="05 · App Icon" subtitle="Three variants of the strongest mark · tested at 60/44/28px">
        <DCArtboard id="icon-a" label="A · Gold-leaf on black" width={360} height={500}>
          <div style={{background:"#15151A", height:"100%", display:"flex", flexDirection:"column"}}>
            <div style={{aspectRatio:"1/1", overflow:"hidden"}}><IconA/></div>
            <div style={{flex:1, padding:"16px 18px"}}>
              <div className="holy-system" style={{color:"var(--holy-gold)", marginBottom:8}}>[ ICON.A · GOLD-LEAF ]</div>
              <div style={{fontFamily:"var(--font-body)", fontSize:12, color:"var(--holy-ivory-muted)", lineHeight:1.45}}>
                Byzantine gold disc, cruciform halo, H-cross ligature.
                Most ceremonial of the three — leans hardest sacred.
              </div>
              <IconScale icon={IconA}/>
            </div>
          </div>
        </DCArtboard>
        <DCArtboard id="icon-b" label="B · Inverted ivory" width={360} height={500}>
          <div style={{background:"#15151A", height:"100%", display:"flex", flexDirection:"column"}}>
            <div style={{aspectRatio:"1/1", overflow:"hidden"}}><IconB/></div>
            <div style={{flex:1, padding:"16px 18px"}}>
              <div className="holy-system" style={{color:"var(--holy-gold)", marginBottom:8}}>[ ICON.B · INVERTED ]</div>
              <div style={{fontFamily:"var(--font-body)", fontSize:12, color:"var(--holy-ivory-muted)", lineHeight:1.45}}>
                Parchment field, matte black disc, gold cruciform. Reads as a wax-stamped
                manuscript — KCD2-adjacent.
              </div>
              <IconScale icon={IconB}/>
            </div>
          </div>
        </DCArtboard>
        <DCArtboard id="icon-c" label="C · Tactical bracket" width={360} height={500}>
          <div style={{background:"#15151A", height:"100%", display:"flex", flexDirection:"column"}}>
            <div style={{aspectRatio:"1/1", overflow:"hidden"}}><IconC/></div>
            <div style={{flex:1, padding:"16px 18px"}}>
              <div className="holy-system" style={{color:"var(--holy-gold)", marginBottom:8}}>[ ICON.C · TACTICAL ]</div>
              <div style={{fontFamily:"var(--font-body)", fontSize:12, color:"var(--holy-ivory-muted)", lineHeight:1.45}}>
                System bracket frame, gold H mark with diegetic [HOLY] stamp.
                Reads as Solo Leveling-System made sacred.
              </div>
              <IconScale icon={IconC}/>
            </div>
          </div>
        </DCArtboard>
      </DCSection>

      {/* ─────────── SAMPLE SCREENS ─────────── */}
      <DCSection id="screens" title="06 · Palette Validation" subtitle="Color system applied to two app screens · parchment + gold + matte black">
        <DCArtboard id="status" label="Status Window — Hannes · Sentinel · Tempered" width={390} height={844}>
          <StatusWindow/>
        </DCArtboard>
        <DCArtboard id="quests" label="Daily Quest Panel — Day 47" width={390} height={844}>
          <DailyQuestPanel/>
        </DCArtboard>
        {/* Color tokens reference card */}
        <DCArtboard id="tokens" label="Tokens · Reference" width={360} height={844}>
          <ColorTokens/>
        </DCArtboard>
      </DCSection>

      {/* ─────────── TYPOGRAPHY ─────────── */}
      <DCSection id="type" title="07 · Typography Hierarchy" subtitle="Five voices: Display · Body · Scripture · System · Sacred">
        <DCArtboard id="type-hier" label="Five voices in context" width={920} height={1020}>
          <TypographyHierarchy/>
        </DCArtboard>
      </DCSection>

      {/* ─────────── PATTERN LIBRARY ─────────── */}
      <DCSection id="patterns" title="08 · Pattern Library" subtitle="11 motifs · 4 sacred · 3 tactical · 3 streetwear · 1 hybrid">
        <DCArtboard id="p-cross"  label="Orthodox Cross" width={260} height={320}><P_OrthodoxCross/></DCArtboard>
        <DCArtboard id="p-chirho" label="Chi-Rho"        width={260} height={320}><P_ChiRho/></DCArtboard>
        <DCArtboard id="p-halo"   label="Halo Geometry"  width={260} height={320}><P_HaloGeometry/></DCArtboard>
        <DCArtboard id="p-frame"  label="Icon Frame"     width={260} height={320}><P_SacredFrame/></DCArtboard>
        <DCArtboard id="p-hud"    label="HUD Brackets"   width={260} height={320}><P_HUDBrackets/></DCArtboard>
        <DCArtboard id="p-glow"   label="Glow Panel"     width={260} height={320}><P_GlowBorder/></DCArtboard>
        <DCArtboard id="p-reticle"label="Target Reticle" width={260} height={320}><P_Reticle/></DCArtboard>
        <DCArtboard id="p-label"  label="Industrial Label" width={260} height={320}><P_IndustrialLabel/></DCArtboard>
        <DCArtboard id="p-tag"    label="Hand Tag"       width={260} height={320}><P_GraffitiTag/></DCArtboard>
        <DCArtboard id="p-brut"   label="Brutalist Divider" width={260} height={320}><P_BrutalistDivider/></DCArtboard>
        <DCArtboard id="p-hybrid" label="Seal & System"  width={260} height={320}><P_HybridWax/></DCArtboard>
      </DCSection>

      <DCPostIt top={40} left={400} width={260} rotate={1.5}>
        <strong>The single test</strong><br/>
        Does it feel like Solo Leveling's System <em>made sacred</em>?
        A Byzantine icon hand-tagged by a streetwear artist?
        <br/><br/>
        Yes = HOLY. Generic = reject.
      </DCPostIt>
    </DesignCanvas>
  );
}

// Color token reference card (palette validation companion)
function ColorTokens() {
  const tokens = [
    { name: "Matte Black",     hex: "#0A0A0A", role: "Base",        fg: "#E8E2D5" },
    { name: "Surface Lifted",  hex: "#15151A", role: "Cards",       fg: "#E8E2D5" },
    { name: "Byzantine Gold",  hex: "#C9A961", role: "Primary",     fg: "#0A0A0A" },
    { name: "Aged Bronze",     hex: "#8B5A2B", role: "Secondary",   fg: "#E8E2D5" },
    { name: "Silver",          hex: "#C0C0C0", role: "Structure",   fg: "#0A0A0A" },
    { name: "Parchment Ivory", hex: "#E8E2D5", role: "Text",        fg: "#0A0A0A" },
    { name: "Aged Ivory",      hex: "#8A8378", role: "Muted",       fg: "#0A0A0A" },
    { name: "Martyr Crimson",  hex: "#7A1F1F", role: "Crisis",      fg: "#E8E2D5" },
  ];
  return (
    <div style={{
      width:"100%", height:"100%", background:"#0A0A0A",
      color:"var(--holy-ivory)", padding:"24px 22px",
      display:"flex", flexDirection:"column", fontFamily:"var(--font-body)",
    }}>
      <div className="holy-system" style={{color:"var(--holy-gold)"}}>[ PALETTE.SYS ]</div>
      <h2 className="holy-display" style={{margin:"6px 0 14px", fontSize:28, letterSpacing:"0.02em"}}>
        SYSTEM<br/>PALETTE.
      </h2>
      <div style={{display:"flex", flexDirection:"column", gap:6, flex:1}}>
        {tokens.map(t => (
          <div key={t.hex} style={{
            display:"flex", alignItems:"center", padding:"10px 12px",
            background: t.hex, color: t.fg,
            border:"1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontFamily:"var(--font-display)", fontWeight:900, fontSize:14, textTransform:"uppercase", letterSpacing:"0.02em"}}>
                {t.name}
              </div>
              <div style={{fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.18em", opacity:0.7, marginTop:1}}>
                {t.role.toUpperCase()}
              </div>
            </div>
            <div style={{fontFamily:"var(--font-mono)", fontSize:11, letterSpacing:"0.05em"}}>{t.hex}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:14, paddingTop:12, borderTop:"1px dashed rgba(232,226,213,0.18)"}}>
        <div style={{fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.2em", color:"var(--holy-ivory-muted)", lineHeight:1.6}}>
          ◇ GOLD = SACRED MOMENTS<br/>
          ◇ BRONZE = SECONDARY<br/>
          ◇ CRIMSON = CRISIS ONLY<br/>
          ◇ NO FLAT GRADIENTS · ALWAYS TEXTURED
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
