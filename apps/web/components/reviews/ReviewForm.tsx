"use client";

// Customer review form: star rating, text, optional photo/video upload with a
// clear marketing-use consent notice. Submits to /api/review (lands as pending
// for moderation).
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export function ReviewForm({ sku }: { sku: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [consent, setConsent] = useState(false);
  const [media, setMedia] = useState<{ type: string; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const sb = supabaseBrowser();
    if (!sb) return;
    setBusy(true);
    for (const file of files) {
      const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
      const path = `${sku}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from("review-media").upload(path, file, { contentType: file.type });
      if (error) { setErr(error.message); continue; }
      const { data } = sb.storage.from("review-media").getPublicUrl(path);
      setMedia((m) => [...m, { type: file.type.startsWith("video") ? "video" : "image", url: data.publicUrl }]);
    }
    setBusy(false);
    e.target.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (media.length && !consent) { setErr("Please tick the consent box to upload media."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, name, title, body, rating, consent, media }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); setErr(j.error || "Something went wrong."); setState("error"); }
      else setState("done");
    } catch {
      setState("error");
    }
    setBusy(false);
  }

  if (state === "done") {
    return (
      <div style={{ border: `1px solid ${GOLD}29`, background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "20px 22px", marginTop: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.16em" }}>[ THANK YOU, BROTHER ]</div>
        <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A", margin: "8px 0 0" }}>Your review was submitted and will appear once approved.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E8D08C", background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}59`, borderRadius: 14, padding: "13px 26px", cursor: "pointer", marginTop: 10 }}>
        Write a review
      </button>
    );
  }

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "rgba(21,21,26,0.7)", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "12px 14px", width: "100%" };

  return (
    <form onSubmit={submit} style={{ border: `1px solid ${GOLD}29`, background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))", borderRadius: 18, boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "22px 22px", marginTop: 16, display: "grid", gap: 14, maxWidth: 620 }}>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 16, color: "#E8E2D5" }}>Write a review</div>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" aria-label={`Rate ${i} ${i === 1 ? "star" : "stars"}`} aria-pressed={rating === i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: GOLD, opacity: i <= (hover || rating) ? 1 : 0.25, padding: 0 }}>★</button>
        ))}
      </div>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" required style={inp} />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline (optional)" aria-label="Review headline" style={inp} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tell the brotherhood what you think..." aria-label="Your review" required rows={4} style={{ ...inp, resize: "vertical" }} />

      {/* media + consent */}
      <div>
        <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", borderRadius: 12, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", padding: "11px 16px", cursor: "pointer", display: "inline-block" }}>
          {busy ? "Uploading..." : "Add photos / video"}
          <input type="file" accept="image/*,video/*" multiple onChange={onUpload} disabled={busy} style={{ display: "none" }} />
        </label>
        {media.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {media.map((m, i) => (
              <div key={i} style={{ width: 54, height: 54, border: `1px solid ${GOLD}44`, borderRadius: 10, overflow: "hidden", background: "#15151A" }}>
                {m.type === "video" ? <video src={m.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
            ))}
          </div>
        )}
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, fontFamily: BODY, fontSize: 12, color: "#9A948A", lineHeight: 1.5 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
          <span>I agree that any photos or videos I upload may be used by TABOR for marketing. Please be mindful of your surroundings and anyone in the shot.</span>
        </label>
      </div>

      {err && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A" }}>{err}</p>}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={busy} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 14, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", padding: "13px 26px", cursor: "pointer" }}>Submit review</button>
        <button type="button" onClick={() => setOpen(false)} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A948A", background: "rgba(201,169,97,0.04)", border: "1px solid rgba(201,169,97,0.22)", borderRadius: 14, padding: "13px 20px", cursor: "pointer" }}>Cancel</button>
      </div>
    </form>
  );
}
