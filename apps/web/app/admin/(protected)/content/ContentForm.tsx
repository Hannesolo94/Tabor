"use client";

// Home hero editor. Edit copy, an optional background image/video (uploaded to
// storage), and the CTA labels/links. CTAs are fixed in position by the layout;
// only their text and destination are editable here.
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { saveHero } from "./actions";
import type { HeroContent } from "@/lib/content-db";
import { GOLD, MONO, BODY } from "@/lib/ui";

const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, color: "#8A847A", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "10px 12px", width: "100%" };

export function ContentForm({ hero }: { hero: HeroContent }) {
  const [bgUrl, setBgUrl] = useState(hero.bg_url);
  const [bgType, setBgType] = useState(hero.bg_type);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const sb = supabaseBrowser();
    if (!sb) { setErr("Storage not configured."); return; }
    setBusy(true);
    setErr(null);
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
    const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await sb.storage.from("product-media").upload(path, file, { contentType: file.type });
    if (error) { setErr(error.message); setBusy(false); return; }
    const { data } = sb.storage.from("product-media").getPublicUrl(path);
    setBgUrl(data.publicUrl);
    setBgType(file.type.startsWith("video") ? "video" : "image");
    setBusy(false);
    e.target.value = "";
  }

  return (
    <form action={saveHero} style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      <div><label style={lbl}>Eyebrow (small label above headline)</label><input name="eyebrow" defaultValue={hero.eyebrow} style={inp} /></div>
      <div><label style={lbl}>Headline</label><input name="headline" defaultValue={hero.headline} style={inp} /></div>
      <div><label style={lbl}>Subcopy</label><textarea name="subcopy" defaultValue={hero.subcopy} rows={3} style={{ ...inp, resize: "vertical" }} /></div>

      {/* background media */}
      <div style={{ border: "1px solid rgba(201,169,97,0.16)", padding: "16px 16px" }}>
        <label style={lbl}>Background media (optional)</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select name="bg_type" value={bgType} onChange={(e) => setBgType(e.target.value as HeroContent["bg_type"])} style={{ ...inp, width: "auto" }}>
            <option value="none">None (seal backdrop)</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, padding: "10px 14px", cursor: "pointer" }}>
            {busy ? "Uploading..." : "Upload"}
            <input type="file" accept="image/*,video/*" onChange={onUpload} disabled={busy} style={{ display: "none" }} />
          </label>
          {bgUrl && <span style={{ fontFamily: MONO, fontSize: 9, color: "#7BBF7B" }}>● media set</span>}
        </div>
        <input type="hidden" name="bg_url" value={bgUrl} />
        {bgUrl && (
          <div style={{ marginTop: 12, width: 200, aspectRatio: "16/9", overflow: "hidden", border: "1px solid rgba(201,169,97,0.2)" }}>
            {bgType === "video" ? (
              <video src={bgUrl} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
        )}
        {err && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginTop: 8 }}>{err}</p>}
      </div>

      {/* CTAs — labels + links editable, positions fixed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div><label style={lbl}>Button 1 text</label><input name="cta1_label" defaultValue={hero.cta1_label} style={inp} /></div>
        <div><label style={lbl}>Button 1 link</label><input name="cta1_href" defaultValue={hero.cta1_href} style={inp} /></div>
        <div><label style={lbl}>Button 2 text</label><input name="cta2_label" defaultValue={hero.cta2_label} style={inp} /></div>
        <div><label style={lbl}>Button 2 link</label><input name="cta2_href" defaultValue={hero.cta2_href} style={inp} /></div>
      </div>
      <p style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.06em" }}>BUTTON POSITIONS ARE FIXED BY THE LAYOUT. ONLY TEXT + LINKS ARE EDITABLE, SO THE DESIGN NEVER BREAKS.</p>

      <div><button type="submit" disabled={busy} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "13px 26px", cursor: "pointer" }}>Save hero</button></div>
    </form>
  );
}
