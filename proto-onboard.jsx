// proto-onboard.jsx — The Awakening: faith gate + assessment, fits screen, animated
const { useState: useOS } = React;

function Stage({ children, justify = "center", k, progress }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: justify, padding: "70px 22px 26px", position: "relative", overflow: "hidden", background: "radial-gradient(ellipse 70% 50% at 50% 34%, rgba(201,169,97,0.10), transparent 70%), #0A0A0A" }}>
      <style>{`
        @keyframes ob-in{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
        @keyframes ob-seal{0%{opacity:0;transform:scale(.7);filter:blur(7px)}100%{opacity:1;transform:none;filter:none}}
        @keyframes ob-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .ob-pick{transition:transform .16s cubic-bezier(.2,.8,.2,1),background .2s,box-shadow .2s,color .2s,border-color .2s}
        .ob-pick:active{transform:scale(.95)!important}
      `}</style>
      {progress != null && <div style={{ position: "absolute", top: 52, left: 22, right: 22, height: 3, background: "rgba(201,169,97,0.15)" }}><div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(90deg,#8B6B22,#C9A961,#E8D08C)", transition: "width .4s cubic-bezier(.2,.8,.2,1)" }} /></div>}
      <div key={k} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: justify, animation: "ob-in .42s cubic-bezier(.2,.8,.2,1)" }}>{children}</div>
    </div>
  );
}
const ttl = { fontFamily: "'Cinzel', serif", fontWeight: 700, color: "var(--holy-ivory)", letterSpacing: "0.04em", lineHeight: 1.25 };
const kick = { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.26em" };
const bodyT = { fontFamily: "var(--font-body)", fontSize: 14, color: "#B8B2A6", lineHeight: 1.55 };
const scrollArea = { flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 2, display: "flex", flexDirection: "column", justifyContent: "center" };

function OBChip({ label, on, onClick }) {
  return <button className="ob-pick" onClick={onClick} style={{ cursor: "pointer", fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 15, color: on ? "#0A0A0A" : "var(--holy-ivory)", background: on ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "transparent", border: "1px solid rgba(201,169,97,0.5)", padding: "10px 16px", margin: "0 8px 8px 0", transform: on ? "scale(1.03)" : "none", boxShadow: on ? "0 0 16px rgba(201,169,97,0.35)" : "none" }}>{label}</button>;
}
function OBCard({ title, desc, on, onClick, tone }) {
  const bd = tone === "crimson" ? (on ? "rgba(192,58,58,0.7)" : "rgba(122,31,31,0.4)") : (on ? "rgba(201,169,97,0.6)" : "rgba(201,169,97,0.22)");
  return <button className="ob-pick" onClick={onClick} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: on ? (tone === "crimson" ? "rgba(122,31,31,0.18)" : "rgba(201,169,97,0.14)") : "#0E0E12", border: `1px solid ${bd}`, padding: "14px 15px", marginBottom: 9, transform: on ? "scale(1.02)" : "none", boxShadow: on ? "0 0 16px rgba(201,169,97,0.3)" : "none" }}>
    <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: on ? (tone === "crimson" ? "#E08585" : "var(--holy-gold)") : "var(--holy-ivory)" }}>{title}</div>
    {desc && <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "#9A948A", marginTop: 3 }}>{desc}</div>}
  </button>;
}
function Head({ kicker, title, sub }) {
  return <div style={{ marginBottom: 14 }}>
    <div style={kick}>{kicker}</div>
    <h1 style={{ ...ttl, fontSize: 25, marginTop: 12 }}>{title}</h1>
    {sub && <p style={{ ...bodyT, fontSize: 13, marginTop: 8 }}>{sub}</p>}
  </div>;
}
const TOTAL = 11;

function Awakening({ onFinish }) {
  const [step, setStep] = useOS(0);
  const [denied, setDenied] = useOS(false);
  const [d, setD] = useOS({ name: "", cls: "", denomination: "Orthodox", believer: "", journey: "", fitnessLevel: "", equipment: "", goals: [] });
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  const toggleGoal = (g) => setD(p => ({ ...p, goals: p.goals.includes(g) ? p.goals.filter(x => x !== g) : [...p.goals, g] }));
  const next = () => setStep(s => s + 1);
  const prog = step >= 3 && step <= 11 ? (step - 2) / TOTAL : null;

  // respectful access gate
  if (denied) return (
    <Stage k="gate">
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", opacity: 0.7 }}><TaborIconSeal id="aw-gate" size={120} /></div>
        <h1 style={{ ...ttl, fontSize: 26, marginTop: 18 }}>Tabor is for the open-hearted.</h1>
        <p style={{ ...bodyT, marginTop: 14, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>This brotherhood is built on the gospel of Jesus Christ. It is for those who follow Him, or who are willing to learn. The door stays open. When your heart is ready, you are welcome.</p>
      </div>
      <GoldBtn onClick={() => { set("believer", "seeking"); setDenied(false); setStep(3); }}>Actually, I am open to learning</GoldBtn>
    </Stage>
  );

  // 0 splash
  if (step === 0) return (
    <Stage k={step}>
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ animation: "ob-seal 1.1s cubic-bezier(.2,.9,.2,1) both", display: "flex", justifyContent: "center" }}><TaborIconSeal id="aw-splash" size={140} /></div>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 60, color: "var(--holy-gold)", marginTop: 14, animation: "ob-fade .8s ease .5s both" }}>Tabor</div>
        <div style={{ ...kick, marginTop: 8, animation: "ob-fade .8s ease .8s both" }}>SONS OF FIRE</div>
      </div>
      <div style={{ animation: "ob-fade .8s ease 1.1s both" }}><GoldBtn onClick={next}>Begin the Awakening</GoldBtn></div>
    </Stage>
  );
  // 1 manifesto
  if (step === 1) return (
    <Stage k={step} justify="space-between">
      <div style={scrollArea}>
        <div style={kick}>[ THE MANIFESTO ]</div>
        <h1 style={{ ...ttl, fontSize: 27, marginTop: 14 }}>You were not made for the couch. You were made for the mountain.</h1>
        <p style={{ ...bodyT, marginTop: 14 }}>Most men drift. Tabor is the refusal. Three trials a day, a System at your back, a guild that knows your name. First, the System must measure your heart.</p>
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn onClick={next}>I Answer</GoldBtn></div>
    </Stage>
  );
  // 2 faith gate
  if (step === 2) return (
    <Stage k={step} justify="space-between">
      <div style={scrollArea}>
        <Head kicker="[ THE FIRST QUESTION ]" title="Do you believe in Jesus, our Lord and Saviour?" sub="Tabor is built on the gospel. Answer honestly." />
        <OBCard title="Yes, He is my Lord and Saviour" on={d.believer === "yes"} onClick={() => set("believer", "yes")} />
        <OBCard title="Not yet, but my heart is open" desc="I want to learn and walk toward Him." on={d.believer === "seeking"} onClick={() => set("believer", "seeking")} />
        <OBCard title="No, and I am not seeking" desc="I am not here for the gospel." tone="crimson" on={d.believer === "no"} onClick={() => { set("believer", "no"); setDenied(true); }} />
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={d.believer !== "yes" && d.believer !== "seeking"} onClick={next}>Continue</GoldBtn></div>
    </Stage>
  );
  // 3 calling
  if (step === 3) return (
    <Stage k={step} justify="space-between" progress={prog}>
      <div style={scrollArea}>
        <Head kicker="[ THE CALLING ]" title="What do you climb for?" sub="Choose all that drive you." />
        <div style={{ display: "flex", flexWrap: "wrap" }}>{["Discipline", "Faith", "Strength", "Brotherhood", "Purpose", "Focus"].map(o => <OBChip key={o} label={o} on={d.goals.includes("call:" + o)} onClick={() => toggleGoal("call:" + o)} />)}</div>
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={!d.goals.some(g => g.startsWith("call:"))} onClick={next}>Continue</GoldBtn></div>
    </Stage>
  );
  // 4 journey
  if (step === 4) return (
    <Stage k={step} justify="space-between" progress={prog}>
      <div style={scrollArea}>
        <Head kicker="[ YOUR WALK ]" title={d.believer === "seeking" ? "Where are you starting from?" : "Where are you in your faith?"} sub="So the Word meets you where you stand." />
        {(d.believer === "seeking"
          ? [["Curious", "New to all of this, but open."], ["Exploring", "Reading and asking questions."], ["Drawing near", "Ready to follow."]]
          : [["New to faith", "Just beginning to follow Christ."], ["Returning", "Coming back after time away."], ["Steady", "Walking consistently."], ["Devoted", "Going deep, discipling others."]]
        ).map(([t, ds]) => <OBCard key={t} title={t} desc={ds} on={d.journey === t} onClick={() => set("journey", t)} />)}
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={!d.journey} onClick={next}>Continue</GoldBtn></div>
    </Stage>
  );
  // 5 fitness
  if (step === 5) return (
    <Stage k={step} justify="space-between" progress={prog}>
      <div style={scrollArea}>
        <Head kicker="[ THE BODY ]" title="Your training right now?" sub="The iron will be set to your level." />
        {[["Beginner", "New to training, or starting over."], ["Intermediate", "Train sometimes, want consistency."], ["Advanced", "Train hard, chasing more."]].map(([t, ds]) => <OBCard key={t} title={t} desc={ds} on={d.fitnessLevel === t} onClick={() => set("fitnessLevel", t)} />)}
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={!d.fitnessLevel} onClick={next}>Continue</GoldBtn></div>
    </Stage>
  );
  // 6 equipment
  if (step === 6) return (
    <Stage k={step} justify="space-between" progress={prog}>
      <div style={scrollArea}>
        <Head kicker="[ THE ARSENAL ]" title="What can you train with?" sub="Routines adapt to what you have." />
        {[["Bodyweight only", "No equipment. Train anywhere."], ["Minimal", "Dumbbells, bands, a bar."], ["Full gym", "Full access to weights."]].map(([t, ds]) => <OBCard key={t} title={t} desc={ds} on={d.equipment === t} onClick={() => set("equipment", t)} />)}
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={!d.equipment} onClick={next}>Continue</GoldBtn></div>
    </Stage>
  );
  // 7 goals
  if (step === 7) return (
    <Stage k={step} justify="space-between" progress={prog}>
      <div style={scrollArea}>
        <Head kicker="[ THE AIM ]" title="What are you chasing?" sub="Pick your targets." />
        <div style={{ display: "flex", flexWrap: "wrap" }}>{["Build strength", "Lose weight", "Endurance", "Consistency", "Mobility", "Discipline"].map(o => <OBChip key={o} label={o} on={d.goals.includes(o)} onClick={() => toggleGoal(o)} />)}</div>
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={!d.goals.some(g => !g.startsWith("call:"))} onClick={next}>Continue</GoldBtn></div>
    </Stage>
  );
  // 8 class
  if (step === 8) return (
    <Stage k={step} justify="space-between" progress={prog}>
      <div style={scrollArea}>
        <Head kicker="[ THE TRIALS ]" title="The System names your class." />
        {Object.entries(CLASSES).map(([n, c]) => <OBCard key={n} title={n} desc={`${c.tag}. ${c.blurb}`} on={d.cls === n} onClick={() => set("cls", n)} />)}
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={!d.cls} onClick={next}>Continue</GoldBtn></div>
    </Stage>
  );
  // 9 oath
  if (step === 9) return (
    <Stage k={step} justify="space-between" progress={prog}>
      <div style={scrollArea}>
        <Head kicker="[ THE OATH ]" title={`Name yourself, ${d.cls}.`} />
        <input value={d.name} onChange={e => set("name", e.target.value)} placeholder="Your name" style={{ width: "100%", boxSizing: "border-box", background: "rgba(232,226,213,0.04)", border: "1px solid rgba(201,169,97,0.4)", color: "var(--holy-ivory)", fontFamily: "'Pirata One', serif", fontSize: 28, padding: "12px 16px", outline: "none" }} />
        <div style={{ ...kick, marginTop: 18, marginBottom: 10 }}>YOUR TRADITION</div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>{["Orthodox", "Catholic", "Protestant", "Other"].map(t => <OBChip key={t} label={t} on={d.denomination === t} onClick={() => set("denomination", t)} />)}</div>
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={!d.name.trim()} onClick={next}>Swear It</GoldBtn></div>
    </Stage>
  );
  // 10 guild
  if (step === 10) return (
    <Stage k={step} justify="space-between" progress={prog}>
      <div style={scrollArea}>
        <Head kicker="[ FORGE A GUILD ]" title="No man climbs alone." />
        {[["Sons of Tabor · IV", "9 brothers · open"], ["The Tempered", "11 brothers · open"], ["Dawn Watch", "6 brothers · open"]].map(([g, sub]) => <OBCard key={g} title={g} desc={sub} on={d.guild === g} onClick={() => set("guild", g)} />)}
      </div>
      <div style={{ paddingTop: 14 }}><GoldBtn disabled={!d.guild} onClick={next}>Join</GoldBtn></div>
    </Stage>
  );
  // 11 summary
  if (step === 11) {
    const plan = d.believer === "seeking" ? "Seeker's Foundations" : { "New to faith": "Foundations · 40 days", "Returning": "Return track · 30 days", "Steady": "The Gospels track", "Devoted": "Whole-Bible year" }[d.journey] || "The Gospels track";
    const tier = d.equipment === "Bodyweight only" ? "Calisthenics base" : { Beginner: "Foundation", Intermediate: "The Forge", Advanced: "Crucible" }[d.fitnessLevel];
    const focus = d.goals.filter(g => !g.startsWith("call:")).join(", ") || "Consistency";
    const rows = [["Class", d.cls], ["Tradition", `${d.denomination} prayers`], ["Scripture plan", plan], ["Training start", `${tier} · ${d.equipment}`], ["Focus", focus]];
    return (
      <Stage k={step} justify="space-between" progress={prog}>
        <div style={scrollArea}>
          <Head kicker="[ YOUR PATH IS SET ]" title="The System has measured you." sub="A plan, tailored to your answers." />
          <div style={{ border: "1px solid rgba(201,169,97,0.35)", background: "#0E0E12" }}>
            {rows.map(([l, v], i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 15px", borderBottom: i < rows.length - 1 ? "1px solid rgba(201,169,97,0.12)" : "none" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.16em", textTransform: "uppercase" }}>{l}</span>
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-gold)", textAlign: "right", maxWidth: "62%" }}>{v}</span>
            </div>)}
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "#7A746A", lineHeight: 1.5, margin: "12px 4px 0", textAlign: "center" }}>Your data is yours. We keep only what the app needs to run, and you can erase everything in an instant from Settings.</p>
        <div style={{ paddingTop: 14 }}><GoldBtn onClick={next}>Reveal My Rank</GoldBtn></div>
      </Stage>
    );
  }
  // 12 reveal
  return (
    <Stage k={step}>
      <style>{`@keyframes rv-seal{0%{opacity:0;transform:scale(.5);filter:blur(10px)}60%{opacity:1}100%{opacity:1;transform:none;filter:none}}@keyframes rv-flash{0%{opacity:0}12%{opacity:.6}100%{opacity:0}}`}</style>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, rgba(244,226,172,0.5), transparent 55%)", animation: "rv-flash 1.8s ease-out both", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        <div style={{ ...kick, animation: "ob-fade .6s ease both" }}>[ RANK ATTAINED ]</div>
        <div style={{ animation: "rv-seal 1.4s cubic-bezier(.2,.9,.2,1) .2s both", display: "flex", justifyContent: "center", margin: "18px 0 6px" }}><TaborIconSeal id="aw-reveal" size={160} /></div>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 50, color: "var(--holy-gold)", animation: "ob-fade .8s ease 1s both" }}>{d.believer === "seeking" ? "Pilgrim" : "Tempered"}</div>
        <p style={{ ...bodyT, maxWidth: 300, margin: "12px auto 0", animation: "ob-fade .8s ease 1.3s both" }}>The climb begins now, {d.name || "Son of Fire"}.</p>
      </div>
      <div style={{ animation: "ob-fade .8s ease 1.6s both" }}><GoldBtn onClick={() => onFinish(d)}>Enter Tabor</GoldBtn></div>
    </Stage>
  );
}

Object.assign(window, { Awakening });
