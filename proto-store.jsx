// proto-store.jsx — Apparel storefront (buy in-app or jump to the site)
const { useState: useStS } = React;

const SITE_URL = "https://taborbrotherhood.com"; // placeholder, site not live yet

// Striped placeholder "garment shot" (no real imagery yet)
function GarmentShot({ label, tone = "#15151A" }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", background: tone, overflow: "hidden", display: "grid", placeItems: "center", border: "1px solid rgba(201,169,97,0.18)" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(135deg, rgba(201,169,97,0.06) 0 10px, transparent 10px 20px)" }} />
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontFamily: "'Pirata One', serif", fontSize: 30, color: "rgba(201,169,97,0.5)" }}>Tabor</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#6E6A60", letterSpacing: "0.18em", marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

const PRODUCTS = [
  { id: "tee-sof", name: "Sons of Fire Tee", price: 42, tag: "Heavyweight cotton", tone: "#15151A",
    desc: "240gsm heavyweight tee. Blackletter wordmark across the back, seal at the chest. Built to be worn into the ground." },
  { id: "hood-asc", name: "Ascent Hoodie", price: 88, tag: "Premium fleece", tone: "#121216",
    desc: "Heavy brushed-back fleece hoodie. Tonal seal embroidery, gold inscription at the cuff. The uniform of the climb." },
  { id: "cap-seal", name: "Seal Cap", price: 34, tag: "Structured 6-panel", tone: "#17140E",
    desc: "Structured cap with the forged mountain seal in metallic gold thread." },
  { id: "crew-temp", name: "Tempered Crewneck", price: 76, tag: "Loopback cotton", tone: "#131318",
    desc: "Midweight loopback crew. Minimal seal at chest, Sons of Fire at the nape." },
];

function StoreScreen({ s }) {
  const [product, setProduct] = useStS(null);
  const [bag, setBag] = useStS([]);
  const [size, setSize] = useStS("M");
  const [toast, setToast] = useStS("");

  const openSite = () => window.open(SITE_URL, "_blank");

  if (product) {
    const p = product;
    return (
      <Screen>
        <button onClick={() => setProduct(null)} style={{ background: "none", border: "none", color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: 14 }}>← STORE</button>
        <GarmentShot label={p.tag.toUpperCase()} tone={p.tone} />
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.18em" }}>{p.tag.toUpperCase()}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <h2 style={{ fontFamily: "'Pirata One', serif", fontSize: 30, color: "var(--holy-ivory)", margin: 0 }}>{p.name}</h2>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--holy-gold)" }}>${p.price}</span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "#9A948A", lineHeight: 1.55, marginTop: 12 }}>{p.desc}</p>
          {/* size */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--holy-gold)", letterSpacing: "0.2em", margin: "16px 0 8px" }}>SIZE</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["S", "M", "L", "XL"].map(sz => (
              <button key={sz} onClick={() => setSize(sz)} style={{ flex: 1, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 13, color: size === sz ? "#0A0A0A" : "var(--holy-ivory)", background: size === sz ? "linear-gradient(180deg,#E8D08C,#C9A961)" : "transparent", border: "1px solid rgba(201,169,97,0.4)", padding: "12px 0" }}>{sz}</button>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <GoldBtn onClick={() => { setBag(b => [...b, { ...p, size }]); setToast(`${p.name} (${size}) added to bag`); setTimeout(() => setToast(""), 1800); }}>Add to Bag · ${p.price}</GoldBtn>
          </div>
          <div style={{ marginTop: 10 }}>
            <GhostBtn onClick={openSite}>View on the Website ↗</GhostBtn>
          </div>
        </div>
        {toast && <Toast>{toast}</Toast>}
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenTop kicker="[ THE ARMOURY ]" title="Store" right={<Seal size={40} id="store-seal" />} />
      <SystemLine>Wear the climb, {s.cls}. Every thread, forged for the brotherhood.</SystemLine>

      {/* website banner */}
      <button onClick={openSite} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", cursor: "pointer", background: "linear-gradient(180deg, rgba(201,169,97,0.14), rgba(201,169,97,0.03))", border: "1px solid rgba(201,169,97,0.4)", padding: "14px 16px", margin: "16px 0 20px" }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 14, color: "var(--holy-ivory)" }}>The full collection</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#9A948A", letterSpacing: "0.1em", marginTop: 2 }}>TABORBROTHERHOOD.COM</div>
        </div>
        <span style={{ color: "var(--holy-gold)", fontFamily: "var(--font-mono)", fontSize: 13 }}>↗</span>
      </button>

      {/* grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {PRODUCTS.map(p => (
          <button key={p.id} onClick={() => { setProduct(p); setSize("M"); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
            <GarmentShot label={p.tag.toUpperCase()} tone={p.tone} />
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: "var(--holy-ivory)" }}>{p.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--holy-gold)", marginTop: 2 }}>${p.price}</div>
            </div>
          </button>
        ))}
      </div>

      {bag.length > 0 && (
        <div style={{ marginTop: 22, border: "1px solid rgba(201,169,97,0.35)", background: "rgba(20,20,26,0.6)", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#9A948A", letterSpacing: "0.16em" }}>YOUR BAG · {bag.length}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--holy-gold)" }}>${bag.reduce((a, x) => a + x.price, 0)}</span>
          </div>
          <GoldBtn onClick={openSite} style={{ marginTop: 8 }}>Checkout on the Website ↗</GoldBtn>
        </div>
      )}

      <div style={{ marginTop: 20, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9, color: "#6E6A60", letterSpacing: "0.12em", lineHeight: 1.6 }}>
        IN-APP CHECKOUT ARRIVES WITH THE STORE LAUNCH.<br />FOR NOW, BAG SYNCS TO THE WEBSITE.
      </div>
    </Screen>
  );
}

function Toast({ children }) {
  return (
    <div style={{ position: "absolute", left: 20, right: 20, bottom: 96, zIndex: 70, background: "rgba(201,169,97,0.95)", color: "#0A0A0A", fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.04em", textAlign: "center", padding: "13px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>{children}</div>
  );
}

Object.assign(window, { StoreScreen });
