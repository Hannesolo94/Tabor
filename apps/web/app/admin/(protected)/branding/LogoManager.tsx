"use client";

// Upload + replace the live logo art. Two slots: the square Icon (small mark / favicon)
// and the Full logo (horizontal lockup with wordmark). Saved URLs flow into app_settings
// 'brand'.logos and are read by the storefront header/footer + favicon. Replace here ->
// updates on the site (a revalidate fires on save).
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createLogoUploadTicket, saveLogos } from "./actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { BrandLogos } from "@/lib/brand";
import { TaborSeal } from "@/components/TaborSeal";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

type Slot = "icon" | "wordmark";
const MIN_H = 24;
const MAX_H = 80;
// Kept in sync with DEFAULT_WORDMARK_HEIGHT in lib/brand.ts. Defined locally so this
// client component never imports the server-only brand module (next/headers).
const DEFAULT_WORDMARK_HEIGHT = 36;

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "20px 22px" };
const goldButton: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer" };
const ghostButton: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#C03A3A", background: "transparent", border: "1px solid rgba(192,58,58,0.35)", borderRadius: 10, padding: "9px 13px", cursor: "pointer" };

export function LogoManager({ logos }: { logos: BrandLogos }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Slot | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [height, setHeight] = useState<number>(logos.wordmarkHeight ?? DEFAULT_WORDMARK_HEIGHT);
  const [savingSize, setSavingSize] = useState(false);
  const iconRef = useRef<HTMLInputElement>(null);
  const wordRef = useRef<HTMLInputElement>(null);
  const sizeDirty = height !== (logos.wordmarkHeight ?? DEFAULT_WORDMARK_HEIGHT);

  async function commitSize() {
    if (!sizeDirty) return;
    setSavingSize(true); setErr(null);
    try {
      await saveLogos({ ...logos, wordmarkHeight: height });
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Could not save the size.");
    } finally {
      setSavingSize(false);
    }
  }

  async function upload(slot: Slot, file: File) {
    const sb = supabaseBrowser();
    if (!sb) { setErr("Storage client unavailable."); return; }
    if (!file.type.startsWith("image/")) { setErr("Please choose an image (PNG, SVG, JPG, WEBP)."); return; }
    setBusy(slot); setErr(null);
    try {
      const ticket = await createLogoUploadTicket(file.name, slot);
      if ("error" in ticket) { setErr(ticket.error); setBusy(null); return; }
      const { error } = await sb.storage.from("product-media").uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
      if (error) { setErr(error.message); setBusy(null); return; }
      await saveLogos({ ...logos, [slot]: ticket.publicUrl });
      setBusy(null);
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload failed.");
      setBusy(null);
    }
  }

  async function clear(slot: Slot) {
    setBusy(slot); setErr(null);
    try {
      await saveLogos({ ...logos, [slot]: null });
      setBusy(null);
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Could not remove.");
      setBusy(null);
    }
  }

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 18, color: "#E8E2D5", margin: 0 }}>Logo &amp; icon</h2>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "5px 0 0" }}>
          Upload your live logo art. Replacing it here updates the website header, footer, and browser tab icon. Use a transparent PNG or SVG so it sits cleanly on the dark theme. With no upload, the built-in gold seal is used.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {/* ICON slot */}
        <div className="admin-card" style={cardStyle}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>Icon · square mark</div>
          <p style={{ fontFamily: BODY, fontSize: 12, color: "#8A847A", margin: "0 0 14px", lineHeight: 1.5 }}>The small mark in tight spots and the browser tab favicon. Square, ideally 512&times;512.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 14, background: "#0A0A0A", border: "1px solid rgba(201,169,97,0.22)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {logos.icon
                ? <img src={logos.icon} alt="Current icon" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                : <TaborSeal id="logomgr-icon" size={56} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input ref={iconRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload("icon", f); e.target.value = ""; }} />
              <button type="button" disabled={busy === "icon"} onClick={() => iconRef.current?.click()} style={{ ...goldButton, opacity: busy === "icon" ? 0.6 : 1 }}>{busy === "icon" ? "Uploading…" : logos.icon ? "Replace icon" : "Upload icon"}</button>
              {logos.icon && <button type="button" disabled={busy === "icon"} onClick={() => clear("icon")} style={ghostButton}>Remove</button>}
            </div>
          </div>
        </div>

        {/* WORDMARK slot */}
        <div className="admin-card" style={cardStyle}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>Full logo · horizontal lockup</div>
          <p style={{ fontFamily: BODY, fontSize: 12, color: "#8A847A", margin: "0 0 14px", lineHeight: 1.5 }}>The primary logo (mark + wordmark). When set, it replaces the seal and the &ldquo;Tabor&rdquo; text in the header and footer. Wide transparent PNG/SVG.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ minWidth: 140, minHeight: 72, padding: "10px 14px", borderRadius: 14, background: "#0A0A0A", border: "1px solid rgba(201,169,97,0.22)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flex: 1 }}>
              {logos.wordmark
                ? <img src={logos.wordmark} alt="Current logo" style={{ maxWidth: "100%", height, objectFit: "contain", display: "block" }} />
                : <span style={{ fontFamily: "var(--font-pirata), serif", fontSize: 30, color: GOLD }}>Tabor</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input ref={wordRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload("wordmark", f); e.target.value = ""; }} />
              <button type="button" disabled={busy === "wordmark"} onClick={() => wordRef.current?.click()} style={{ ...goldButton, opacity: busy === "wordmark" ? 0.6 : 1 }}>{busy === "wordmark" ? "Uploading…" : logos.wordmark ? "Replace logo" : "Upload logo"}</button>
              {logos.wordmark && <button type="button" disabled={busy === "wordmark"} onClick={() => clear("wordmark")} style={ghostButton}>Remove</button>}
            </div>
          </div>

          {/* Size control — only meaningful once a logo is set */}
          {logos.wordmark && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(201,169,97,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase" }}>Logo size</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#C3BDB1" }}>{height}px</span>
              </div>
              <input
                type="range"
                min={MIN_H}
                max={MAX_H}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                aria-label="Logo height"
                style={{ width: "100%", accentColor: GOLD, cursor: "pointer" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <button type="button" disabled={!sizeDirty || savingSize} onClick={commitSize} style={{ ...goldButton, opacity: !sizeDirty || savingSize ? 0.5 : 1 }}>{savingSize ? "Saving…" : "Save size"}</button>
                {sizeDirty && !savingSize && <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A" }}>Unsaved change</span>}
                {height !== DEFAULT_WORDMARK_HEIGHT && <button type="button" onClick={() => setHeight(DEFAULT_WORDMARK_HEIGHT)} style={{ ...ghostButton, color: "#8A847A", borderColor: "rgba(255,255,255,0.14)" }}>Reset</button>}
              </div>
            </div>
          )}
        </div>
      </div>

      {err && <div style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginTop: 12 }}>{err}</div>}
    </section>
  );
}
