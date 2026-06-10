"use client";

// The Content Studio composer. Build a post (title, brief, card-sequence media,
// caption) and publish it to the app feed / email / blog. Card 1 is always the
// cover/first in the sequence; start with 3 cards, add more as needed, reorder, clear.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createMediaUpload, savePost, publishPost, draftFromBrief, type PostTargets, type MediaCard } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

const TYPES = ["static", "carousel", "video", "reel", "gif", "mixed"];
type Slot = MediaCard | null;

interface PostData { id: string; title: string; slug: string; excerpt: string | null; body: string; cover_image: string | null; author: string | null; type: string | null; brief: string | null; targets: PostTargets | null; status: string }

const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "11px 13px", width: "100%" };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const card: React.CSSProperties = { border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const gold: React.CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "12px 22px", cursor: "pointer" };
const ghost: React.CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C3BDB1", background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}44`, borderRadius: 12, padding: "12px 20px", cursor: "pointer" };

export function PostComposer({ post, media }: { post: PostData; media: MediaCard[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [body, setBody] = useState(post.body ?? "");
  const [author, setAuthor] = useState(post.author ?? "TABOR");
  const [type, setType] = useState(post.type ?? "static");
  const [brief, setBrief] = useState(post.brief ?? "");
  const [targets, setTargets] = useState<PostTargets>(post.targets ?? { app: true, email: false, blog: true, instagram: false, tiktok: false });
  const pad3 = (arr: Slot[]) => { const c = [...arr]; while (c.length < 3) c.push(null); return c; };
  const [cards, setCards] = useState<Slot[]>(pad3(media.length ? media : []));
  const [saving, setSaving] = useState(false);
  const [pubbing, setPubbing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  async function doDraft() {
    if (cards.some((m) => m?.url === "__uploading__")) { setMsg("Wait for uploads to finish."); return; }
    if (!brief.trim()) { setMsg("Add a brief first."); return; }
    setDrafting(true); setMsg("");
    // persist the brief + media so Claude can see them, then draft
    await savePost({ id: post.id, title, slug, excerpt, body, cover_image: post.cover_image ?? "", author, type, brief, targets, media: collectMedia() });
    const r = await draftFromBrief(post.id);
    setDrafting(false);
    if (!r.ok) { setMsg(r.error || "Draft failed."); return; }
    if (r.draft) { setTitle(r.draft.title); setExcerpt(r.draft.excerpt ?? ""); setBody(r.draft.body); }
    setMsg("Drafted ✓ Review it below, then publish");
    setTimeout(() => setMsg(""), 4000);
  }

  const kindOf = (f: File) => (f.type.includes("gif") ? "gif" : f.type.startsWith("video") ? "video" : "image");

  async function uploadTo(i: number, file: File) {
    const sb = supabaseBrowser();
    if (!sb) { setMsg("Storage unavailable."); return; }
    setCards((c) => { const n = [...c]; n[i] = { kind: kindOf(file), url: "__uploading__", poster_url: null }; return n; });
    const ticket = await createMediaUpload(file.name);
    if ("error" in ticket) { setMsg(ticket.error); setCards((c) => { const n = [...c]; n[i] = null; return n; }); return; }
    const { error } = await sb.storage.from("content-media").uploadToSignedUrl(ticket.path, ticket.token, file);
    if (error) { setMsg(error.message); setCards((c) => { const n = [...c]; n[i] = null; return n; }); return; }
    setCards((c) => { const n = [...c]; n[i] = { kind: kindOf(file), url: ticket.publicUrl, poster_url: null }; return n; });
  }
  const clearCard = (i: number) => setCards((c) => { const n = [...c]; n[i] = null; if (fileRefs.current[i]) fileRefs.current[i]!.value = ""; return n; });
  const move = (i: number, d: number) => setCards((c) => { const n = [...c]; const j = i + d; if (j < 0 || j >= n.length) return c; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const addCard = () => setCards((c) => [...c, null]);
  const collectMedia = (): MediaCard[] => cards.filter((m): m is MediaCard => !!m && m.url !== "__uploading__");

  async function doSave(publish: boolean) {
    if (cards.some((m) => m?.url === "__uploading__")) { setMsg("Wait for uploads to finish."); return; }
    publish ? setPubbing(true) : setSaving(true); setMsg("");
    await savePost({ id: post.id, title, slug, excerpt, body, cover_image: post.cover_image ?? "", author, type, brief, targets, media: collectMedia() });
    if (publish) await publishPost(post.id);
    publish ? setPubbing(false) : setSaving(false);
    setMsg(publish ? "Published ✓" : "Saved ✓");
    router.refresh();
    setTimeout(() => setMsg(""), 2500);
  }

  const toggleTarget = (k: keyof PostTargets) => setTargets((t) => ({ ...t, [k]: !t[k] }));

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 860 }}>
      {/* title */}
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" style={{ ...inp, fontFamily: CINZEL, fontWeight: 700, fontSize: 22, padding: "14px 16px" }} />

      {/* brief / draft-from-upload */}
      <div style={card}>
        <label style={lbl}>Brief — drop a rough note + your media, then draft the caption from it</label>
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. 'New Risen Knight tee dropped, want a hype post, scripture about rising, link the product'…" style={{ ...inp, minHeight: 64, resize: "vertical" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button type="button" onClick={doDraft} disabled={drafting} style={{ ...gold, padding: "10px 16px" }}>{drafting ? "Drafting…" : "✨ Draft from brief"}</button>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.06em", marginTop: 8 }}>WRITES THE CAPTION FROM YOUR BRIEF + IMAGES, THEN QUEUES IT FOR REVIEW. NEEDS THE ANTHROPIC KEY IN SETTINGS &gt; INTEGRATIONS.</div>
      </div>

      {/* card-sequence media */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5" }}>Media sequence</div>
          <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.1em" }}>CARD 1 = COVER · ORDER = SEQUENCE</span>
        </div>
        <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 14px" }}>Photos, video, or gifs. Fill the cards in order; reorder or clear any time.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {cards.map((m, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: 12, border: `1px ${m ? "solid" : "dashed"} ${GOLD}44`, overflow: "hidden", background: "rgba(15,15,20,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ position: "absolute", top: 6, left: 6, zIndex: 2, fontFamily: MONO, fontSize: 9, fontWeight: 700, color: i === 0 ? "#1a1408" : "#E8E2D5", background: i === 0 ? GOLD : "rgba(0,0,0,0.6)", borderRadius: 6, padding: "2px 6px", letterSpacing: "0.06em" }}>{i === 0 ? "COVER" : i + 1}</span>
              {m && m.url === "__uploading__" ? (
                <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD }}>UPLOADING…</span>
              ) : m ? (
                <>
                  {m.kind === "video"
                    ? <video src={m.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  <div style={{ position: "absolute", bottom: 6, left: 6, right: 6, display: "flex", justifyContent: "space-between", zIndex: 2 }}>
                    <span style={{ display: "flex", gap: 4 }}>
                      <button type="button" onClick={() => move(i, -1)} title="Move left" style={miniBtn}>↑</button>
                      <button type="button" onClick={() => move(i, 1)} title="Move right" style={miniBtn}>↓</button>
                    </span>
                    <button type="button" onClick={() => clearCard(i)} title="Clear" style={{ ...miniBtn, color: "#ff8c8c" }}>×</button>
                  </div>
                  <span style={{ position: "absolute", top: 6, right: 6, zIndex: 2, fontFamily: MONO, fontSize: 8, color: "#E8E2D5", background: "rgba(0,0,0,0.6)", borderRadius: 5, padding: "1px 5px", textTransform: "uppercase" }}>{m.kind}</span>
                </>
              ) : (
                <label style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
                  <input ref={(el) => { fileRefs.current[i] = el; }} type="file" accept="image/*,video/*,image/gif" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadTo(i, f); }} style={{ display: "none" }} />
                  <span style={{ fontFamily: MONO, fontSize: 22, color: `${GOLD}99` }}>+</span>
                  <span style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.08em" }}>PHOTO · VIDEO · GIF</span>
                </label>
              )}
            </div>
          ))}
          <button type="button" onClick={addCard} style={{ aspectRatio: "4 / 5", borderRadius: 12, border: `1px dashed ${GOLD}33`, background: "rgba(201,169,97,0.04)", color: "#9A948A", fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 20, color: `${GOLD}99` }}>+</span>ADD CARD
          </button>
        </div>
      </div>

      {/* type */}
      <div style={card}>
        <label style={lbl}>Post type</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", padding: "8px 14px", borderRadius: 999, cursor: "pointer", color: type === t ? "#1a1408" : GOLD, fontWeight: type === t ? 700 : 400, background: type === t ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.08)", border: `1px solid ${type === t ? "transparent" : `${GOLD}4d`}` }}>{t}</button>
          ))}
        </div>
      </div>

      {/* caption / body */}
      <div style={card}>
        <label style={lbl}>Caption / body</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="The words. Brand voice. No em-dashes." style={{ ...inp, minHeight: 160, resize: "vertical", fontFamily: BODY, lineHeight: 1.6 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          <div><label style={lbl}>Excerpt</label><input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Author</label><input value={author} onChange={(e) => setAuthor(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Slug</label><input value={slug} onChange={(e) => setSlug(e.target.value)} style={inp} /></div>
        </div>
      </div>

      {/* destinations */}
      <div style={card}>
        <label style={lbl}>Publish to</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {([["app", "📱 App feed"], ["email", "✉️ Email"], ["blog", "🌐 Website blog"], ["instagram", "Instagram"], ["tiktok", "TikTok"]] as [keyof PostTargets, string][]).map(([k, label]) => {
            const on = targets[k]; const disabled = false;
            return (
              <button key={k} type="button" disabled={disabled} onClick={() => !disabled && toggleTarget(k)} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.04em", padding: "11px 16px", borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, color: on ? "#1a1408" : "#C3BDB1", fontWeight: on ? 700 : 400, background: on ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.06)", border: `1px solid ${on ? "transparent" : `${GOLD}33`}` }}>{on ? "✓ " : ""}{label}</button>
            );
          })}
        </div>
        {targets.email && <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.06em", marginTop: 10 }}>EMAIL GOES OUT ON PUBLISH, ONLY TO PEOPLE WHO OPTED INTO MARKETING.</div>}
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={() => doSave(false)} disabled={saving || pubbing} style={ghost}>{saving ? "Generating…" : "Generate"}</button>
        <button type="button" onClick={() => doSave(true)} disabled={saving || pubbing} style={gold}>{pubbing ? "Publishing…" : post.status === "published" ? "Update + republish" : "Publish"}</button>
        {msg && <span style={{ fontFamily: MONO, fontSize: 11, color: msg.includes("✓") ? "#7BBF7B" : "#C03A3A", letterSpacing: "0.04em" }}>{msg}</span>}
        <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.08em", marginLeft: "auto" }}>{post.status === "published" ? "● LIVE" : "○ DRAFT"}</span>
      </div>
    </div>
  );
}

const miniBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 12, lineHeight: 1, color: "#E8E2D5", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 7px", cursor: "pointer" };
