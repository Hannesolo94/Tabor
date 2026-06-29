"use client";

// Admin Brand Kit — editable brand identity with per-asset downloads.
// Every download regenerates from the live (draft) brand. Dark admin glass.
import { useState } from "react";
import { type Brand, type Swatch } from "@/lib/brand";
import { saveBrand } from "./actions";
import { downloadBlob, downloadText, svgToPng, cssTokens, scssTokens, jsonTokens, aseSwatch, brandKitPdf } from "@/lib/brand-export";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "20px 22px" };
const cardTitle: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5" };
const goldBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer" };
const ghostBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: GOLD, fontWeight: 700, background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}44`, borderRadius: 10, padding: "9px 14px", cursor: "pointer", textDecoration: "none", display: "inline-block" };
const eyebrow: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", marginBottom: 10 };
const muted: React.CSSProperties = { fontFamily: BODY, fontSize: 12, color: "#8A847A", lineHeight: 1.5 };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "8px 11px", width: "100%" };

function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="admin-card" style={cardStyle}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
          <span style={cardTitle}>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function CopyBtn({ text, label = "copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { void navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1200); }); }}
      style={{ ...ghostBtn, padding: "5px 9px", fontSize: 9 }}
    >
      {done ? "copied" : label}
    </button>
  );
}

export function BrandStudio({ brand, sealSvg, sealDark }: { brand: Brand; sealSvg: string; sealDark: string }) {
  const [draft, setDraft] = useState<Brand>(brand);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const setStatements = (patch: Partial<Brand["statements"]>) => setDraft((d) => ({ ...d, statements: { ...d.statements, ...patch } }));
  const setPalette = (palette: Swatch[]) => setDraft((d) => ({ ...d, palette }));
  const setSwatch = (i: number, patch: Partial<Swatch>) => setPalette(draft.palette.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const onSave = async () => {
    setSaving(true);
    try {
      await saveBrand(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const onPdf = async () => {
    setGenerating(true);
    try {
      const blob = await brandKitPdf(draft, sealDark);
      downloadBlob(blob, "TABOR-Brand-Kit.pdf");
    } finally {
      setGenerating(false);
    }
  };

  const checkered = "repeating-conic-gradient(#cfcfcf 0% 25%, #ffffff 0% 50%) 50% / 22px 22px";

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 920 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={eyebrow}>[ BRAND KIT ]</div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: 0 }}>Brand Studio</h1>
          <p style={{ ...muted, marginTop: 6 }}>Edit the brand identity. Every download regenerates from the current brand.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {editing && (
            <button type="button" onClick={() => void onSave()} disabled={saving} style={{ ...goldBtn, opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          )}
          <button type="button" onClick={() => setEditing((e) => !e)} style={ghostBtn}>
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {/* 1. LOGOS & MARKS — shows the live uploaded logo/icon; falls back to the built-in seal */}
      <Card title="Logos & marks">
        <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 14px", lineHeight: 1.55 }}>
          Your live logo and icon are managed above in &ldquo;Logo &amp; icon.&rdquo; The built-in vector seal below is always available to download for print and partners.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20 }}>
            {draft.logos.icon
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={draft.logos.icon} alt="Icon" style={{ width: 140, height: 140, objectFit: "contain" }} />
              : <div className="brand-seal-fit" style={{ width: 140, height: 140 }} dangerouslySetInnerHTML={{ __html: sealSvg }} />}
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em" }}>{draft.logos.icon ? "ICON · ON BLACK" : "SEAL · ON BLACK"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: checkered, borderRadius: 14, padding: 20 }}>
            {draft.logos.icon
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={draft.logos.icon} alt="Icon" style={{ width: 140, height: 140, objectFit: "contain" }} />
              : <div className="brand-seal-fit" style={{ width: 140, height: 140 }} dangerouslySetInnerHTML={{ __html: sealSvg }} />}
            <span style={{ fontFamily: MONO, fontSize: 9, color: "#3a3a3a", letterSpacing: "0.12em" }}>{draft.logos.icon ? "ICON · ON LIGHT" : "SEAL · ON LIGHT"}</span>
          </div>
        </div>

        {/* lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, padding: "18px 20px", background: "#0A0A0A", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
          {draft.logos.wordmark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.logos.wordmark} alt="Tabor logo" style={{ height: 52, width: "auto", maxWidth: "100%", objectFit: "contain", display: "block" }} />
          ) : (
            <>
              <div className="brand-seal-fit" style={{ width: 64, height: 64, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: sealSvg }} />
              <div>
                <div style={{ fontFamily: "Pirata One, serif", fontSize: 42, lineHeight: 1, color: "#E8E2D5", letterSpacing: "0.04em" }}>TABOR</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.18em", marginTop: 6, textTransform: "uppercase" }}>{draft.statements.tagline}</div>
              </div>
            </>
          )}
        </div>

        <div style={{ fontFamily: MONO, fontSize: 9, color: "#6F6A60", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 18, marginBottom: 8 }}>Built-in seal downloads</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" style={ghostBtn} onClick={() => downloadText(sealSvg, "tabor-seal.svg", "image/svg+xml")}>SVG mark</button>
          <button type="button" style={ghostBtn} onClick={() => downloadText(sealDark, "tabor-seal-dark.svg", "image/svg+xml")}>SVG on black</button>
          <button type="button" style={ghostBtn} onClick={() => { void svgToPng(sealSvg, 512).then((b) => downloadBlob(b, "tabor-seal-512.png")); }}>PNG 512</button>
          <button type="button" style={ghostBtn} onClick={() => { void svgToPng(sealSvg, 1024).then((b) => downloadBlob(b, "tabor-seal-1024.png")); }}>PNG 1024</button>
          <button type="button" style={ghostBtn} onClick={() => { void svgToPng(sealDark, 1024).then((b) => downloadBlob(b, "tabor-seal-black-1024.png")); }}>PNG on black 1024</button>
        </div>
      </Card>

      {/* 2. COLOURS */}
      <Card title="Colours" action={editing ? <button type="button" style={ghostBtn} onClick={() => setPalette([...draft.palette, { name: "New", hex: "#C9A961", role: "" }])}>+ Add swatch</button> : undefined}>
        <div style={{ display: "grid", gap: 10 }}>
          {draft.palette.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 10, background: s.hex, border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }} />
              {editing ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 1fr auto", gap: 8, flex: 1, alignItems: "center" }}>
                  <input style={inp} value={s.name} onChange={(e) => setSwatch(i, { name: e.target.value })} placeholder="Name" />
                  <input style={{ ...inp, fontFamily: MONO }} value={s.hex} onChange={(e) => setSwatch(i, { hex: e.target.value })} placeholder="#C9A961" />
                  <input style={inp} value={s.role} onChange={(e) => setSwatch(i, { role: e.target.value })} placeholder="Role" />
                  <button type="button" aria-label="Remove swatch" style={{ ...ghostBtn, padding: "6px 11px", color: "#C03A3A", borderColor: "rgba(192,58,58,0.4)" }} onClick={() => setPalette(draft.palette.filter((_, idx) => idx !== i))}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: BODY, fontSize: 13.5, color: "#E8E2D5", fontWeight: 600 }}>{s.name}</div>
                    {s.role && <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", marginTop: 2 }}>{s.role}</div>}
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD, marginLeft: "auto" }}>{s.hex.toUpperCase()}</span>
                  <CopyBtn text={s.hex.toUpperCase()} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button type="button" style={ghostBtn} onClick={() => downloadText(cssTokens(draft.palette), "tabor-colors.css", "text/css")}>CSS</button>
          <button type="button" style={ghostBtn} onClick={() => downloadText(scssTokens(draft.palette), "tabor-colors.scss", "text/plain")}>SCSS</button>
          <button type="button" style={ghostBtn} onClick={() => downloadText(jsonTokens(draft), "tabor-tokens.json", "application/json")}>JSON tokens</button>
          <button type="button" style={ghostBtn} onClick={() => downloadBlob(aseSwatch(draft.palette), "tabor.ase")}>.ase (Adobe)</button>
        </div>
      </Card>

      {/* 3. TYPOGRAPHY */}
      <Card title="Typography" action={<CopyBtn label="Copy @import" text={`@import url('https://fonts.googleapis.com/css2?${draft.fonts.map((f) => "family=" + f.google).join("&")}&display=swap');`} />}>
        <div style={{ display: "grid", gap: 18 }}>
          {draft.fonts.map((f, i) => (
            <div key={i} style={{ paddingBottom: 18, borderBottom: i < draft.fonts.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontFamily: `"${f.name}", serif`, fontSize: 34, color: "#E8E2D5", lineHeight: 1.1 }}>{f.name}</div>
                <a href={`https://fonts.google.com/specimen/${f.name.replace(/ /g, "+")}`} target="_blank" rel="noreferrer" style={{ ...ghostBtn, padding: "6px 11px", fontSize: 9 }}>Get on Google Fonts</a>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.1em", marginTop: 8, textTransform: "uppercase" }}>{f.role}</div>
              <div style={{ ...muted, marginTop: 2 }}>{f.usage}</div>
            </div>
          ))}
        </div>
        <p style={{ ...muted, marginTop: 14, fontSize: 11 }}>Fonts licensed under the SIL Open Font License (OFL). Free for product and commercial use.</p>
      </Card>

      {/* 4. VOICE & STATEMENTS */}
      <Card title="Voice & statements">
        <div style={{ display: "grid", gap: 18 }}>
          <Statement label="Tagline" value={draft.statements.tagline}>
            {editing ? <input style={inp} value={draft.statements.tagline} onChange={(e) => setStatements({ tagline: e.target.value })} /> : <p style={lineStyle}>{draft.statements.tagline}</p>}
          </Statement>

          <Statement label="Mission" value={draft.statements.mission}>
            {editing ? <textarea style={{ ...inp, height: 76, resize: "vertical" }} value={draft.statements.mission} onChange={(e) => setStatements({ mission: e.target.value })} /> : <p style={lineStyle}>{draft.statements.mission}</p>}
          </Statement>

          <Statement label="Voice" value={draft.statements.voice}>
            {editing ? <textarea style={{ ...inp, height: 90, resize: "vertical" }} value={draft.statements.voice} onChange={(e) => setStatements({ voice: e.target.value })} /> : <p style={lineStyle}>{draft.statements.voice}</p>}
          </Statement>

          <ListStatement label="Lines" editing={editing} items={draft.statements.lines} onChange={(lines) => setStatements({ lines })} />
          <ListStatement label="Classes" editing={editing} items={draft.statements.classes} onChange={(classes) => setStatements({ classes })} />
          <ListStatement label="Ranks" editing={editing} items={draft.statements.ranks} onChange={(ranks) => setStatements({ ranks })} />
        </div>
      </Card>

      {/* 5. FULL BRAND KIT */}
      <Card title="Full brand kit">
        <button type="button" onClick={() => void onPdf()} disabled={generating} style={{ ...goldBtn, fontSize: 12, padding: "13px 22px", opacity: generating ? 0.6 : 1 }}>
          {generating ? "Generating…" : "Download Brand Kit PDF"}
        </button>
        <p style={{ ...muted, marginTop: 12 }}>A multi-page PDF with the mark, palette, type and voice. Regenerated from the current brand.</p>
      </Card>
    </div>
  );
}

const lineStyle: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#C3BDB1", lineHeight: 1.6, margin: 0 };
const labelStyle: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", marginBottom: 6, textTransform: "uppercase" };

function Statement({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span style={labelStyle}>{label}</span>
        <CopyBtn text={value} />
      </div>
      {children}
    </div>
  );
}

function ListStatement({ label, items, editing, onChange }: { label: string; items: string[]; editing: boolean; onChange: (v: string[]) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span style={labelStyle}>{label}</span>
        <CopyBtn text={items.join("\n")} />
      </div>
      {editing ? (
        <textarea
          style={{ ...inp, height: 88, resize: "vertical", fontFamily: MONO, fontSize: 12 }}
          value={items.join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
        />
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {items.map((it, i) => (
            <span key={i} style={{ fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}26`, borderRadius: 999, padding: "5px 12px" }}>{it}</span>
          ))}
        </div>
      )}
    </div>
  );
}
