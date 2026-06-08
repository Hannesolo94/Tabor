"use client";

// Product media manager: upload images/videos (browser-direct to Supabase
// Storage), pull mockups from Printful, reorder, show/hide, set main, delete.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { addMedia, deleteMedia, makeMain, moveMedia, pullPrintfulImages, toggleVisible } from "./media-actions";
import { GOLD, MONO, BODY } from "@/lib/ui";

export interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  visible: boolean;
  source: string;
}

const ctrl: React.CSSProperties = { fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.06em", textTransform: "uppercase", color: "#C3BDB1", background: "rgba(201,169,97,0.05)", border: "1px solid rgba(201,169,97,0.3)", borderRadius: 8, padding: "4px 6px", cursor: "pointer" };

export function MediaManager({ sku, printfulId, media }: { sku: string; printfulId?: string | null; media: MediaItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const sb = supabaseBrowser();
    if (!sb) { setErr("Storage not configured."); return; }
    setBusy(true);
    setErr(null);
    for (const file of files) {
      const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
      const path = `${sku}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from("product-media").upload(path, file, { contentType: file.type });
      if (error) { setErr(error.message); continue; }
      const { data } = sb.storage.from("product-media").getPublicUrl(path);
      const type = file.type.startsWith("video") ? "video" : "image";
      await addMedia(sku, type, data.publicUrl, "upload");
    }
    setBusy(false);
    e.target.value = "";
    router.refresh();
  }

  return (
    <div style={{ marginTop: 30, paddingTop: 22, borderTop: "1px solid rgba(201,169,97,0.14)" }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.2em", marginBottom: 4 }}>[ MEDIA GALLERY ]</div>
      <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 14px" }}>
        Images and short videos for the product page. Drag order with the arrows, hide what you do not want shown, set the main image. First visible image is the card thumbnail.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>
          {busy ? "Uploading..." : "Upload images / video"}
          <input type="file" accept="image/*,video/*" multiple onChange={onUpload} disabled={busy} style={{ display: "none" }} />
        </label>
        {printfulId && (
          <form action={pullPrintfulImages}>
            <input type="hidden" name="sku" value={sku} />
            <input type="hidden" name="printful_id" value={printfulId} />
            <button type="submit" style={{ ...ctrl, fontSize: 10, padding: "10px 14px" }}>Pull images from Printful</button>
          </form>
        )}
      </div>
      {err && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginBottom: 12 }}>{err}</p>}

      {media.length === 0 ? (
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#7A746A" }}>No media yet. Upload some, or pull from Printful. Until then the product shows the generated seal art.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {media.map((m, i) => (
            <div key={m.id} style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 14, boxShadow: "0 16px 30px -22px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden", opacity: m.visible ? 1 : 0.45 }}>
              <div style={{ position: "relative", aspectRatio: "1 / 1", background: "#15151A", overflow: "hidden" }}>
                {m.type === "video" ? (
                  <video src={m.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                {i === 0 && <span style={{ position: "absolute", top: 6, left: 6, fontFamily: MONO, fontSize: 7, color: "#0A0A0A", background: GOLD, borderRadius: 8, padding: "2px 5px", letterSpacing: "0.08em" }}>MAIN</span>}
                {m.type === "video" && <span style={{ position: "absolute", top: 6, right: 6, color: GOLD, fontSize: 14 }}>▶</span>}
                {!m.visible && <span style={{ position: "absolute", bottom: 6, left: 6, fontFamily: MONO, fontSize: 7, color: "#C03A3A", border: "1px solid #C03A3A", borderRadius: 8, padding: "1px 4px" }}>HIDDEN</span>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 6 }}>
                <form action={moveMedia}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="dir" value="up" /><button style={ctrl}>↑</button></form>
                <form action={moveMedia}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="dir" value="down" /><button style={ctrl}>↓</button></form>
                <form action={makeMain}><input type="hidden" name="id" value={m.id} /><button style={ctrl}>Main</button></form>
                <form action={toggleVisible}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="visible" value={String(m.visible)} /><button style={ctrl}>{m.visible ? "Hide" : "Show"}</button></form>
                <form action={deleteMedia}><input type="hidden" name="id" value={m.id} /><button style={{ ...ctrl, color: "#C03A3A", borderColor: "rgba(192,58,58,0.4)" }}>Del</button></form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
