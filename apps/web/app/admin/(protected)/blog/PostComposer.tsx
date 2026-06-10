"use client";

// The Content Studio composer. Build one post or a whole queue: each block is a
// full post (title, brief, card-sequence media, caption, destinations, optional
// schedule time). The "+" under the last block adds another post. Generate saves
// everything, Publish now fires everything immediately, Schedule queues each block
// for its own time (Zernio fires Instagram/TikTok itself at that moment).
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createMediaUpload, savePost, publishPost, schedulePost, draftFromBrief, createBlankPost, discardPost, type PostTargets, type MediaCard } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

const TYPES = ["static", "carousel", "video", "reel", "gif", "mixed"];
type Slot = MediaCard | null;

export interface PostData { id: string; title: string; slug: string; excerpt: string | null; body: string; cover_image: string | null; author: string | null; type: string | null; brief: string | null; targets: PostTargets | null; status: string; scheduled_for: string | null }

interface SaveInput { id: string; title: string; slug: string; excerpt: string; body: string; cover_image: string; author: string; type: string; brief: string; targets: PostTargets; media: MediaCard[] }
interface BlockHandle { collect: () => SaveInput; scheduleAt: () => string | null; uploading: () => boolean }

const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "11px 13px", width: "100%" };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const card: React.CSSProperties = { border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const gold: React.CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "12px 22px", cursor: "pointer" };
const ghost: React.CSSProperties = { fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C3BDB1", background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}44`, borderRadius: 12, padding: "12px 20px", cursor: "pointer" };
const miniBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 12, lineHeight: 1, color: "#E8E2D5", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 7px", cursor: "pointer" };

const toLocalInput = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function PostComposer({ post, media }: { post: PostData; media: MediaCard[] }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<{ post: PostData; media: MediaCard[] }[]>([{ post, media }]);
  const [statuses, setStatuses] = useState<Record<string, string>>({ [post.id]: post.status });
  const [busy, setBusy] = useState<"" | "save" | "publish" | "schedule" | "add">("");
  const [msg, setMsg] = useState("");
  const handles = useRef(new Map<string, BlockHandle>());

  const setStatus = (id: string, s: string) => setStatuses((m) => ({ ...m, [id]: s }));
  const flash = (text: string, ms = 3500) => { setMsg(text); if (text.includes("✓")) setTimeout(() => setMsg(""), ms); };

  const collectAll = (): { id: string; payload: SaveInput; scheduleAt: string | null }[] | null => {
    const out: { id: string; payload: SaveInput; scheduleAt: string | null }[] = [];
    for (const b of blocks) {
      const h = handles.current.get(b.post.id);
      if (!h) continue;
      if (h.uploading()) { flash("Wait for uploads to finish."); return null; }
      out.push({ id: b.post.id, payload: h.collect(), scheduleAt: h.scheduleAt() });
    }
    return out;
  };

  async function doGenerate() {
    const all = collectAll();
    if (!all) return;
    setBusy("save"); setMsg("");
    await Promise.all(all.map((a) => savePost(a.payload)));
    setBusy("");
    flash(all.length > 1 ? `${all.length} posts saved ✓` : "Saved ✓");
    router.refresh();
  }

  async function doPublishNow() {
    const all = collectAll();
    if (!all) return;
    setBusy("publish"); setMsg("");
    await Promise.all(all.map((a) => savePost(a.payload)));
    for (const a of all) { await publishPost(a.id); setStatus(a.id, "published"); }
    setBusy("");
    flash(all.length > 1 ? `${all.length} posts published ✓` : "Published ✓");
    router.refresh();
  }

  async function doSchedule() {
    const all = collectAll();
    if (!all) return;
    const missing = all.findIndex((a) => !a.scheduleAt);
    if (missing >= 0) { flash(all.length > 1 ? `Post ${missing + 1} has no schedule time. Set one on every post.` : "Pick a schedule date and time first."); return; }
    setBusy("schedule"); setMsg("");
    await Promise.all(all.map((a) => savePost(a.payload)));
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    for (let i = 0; i < all.length; i++) {
      const r = await schedulePost(all[i].id, all[i].scheduleAt as string, tz);
      if (!r.ok) { setBusy(""); flash(all.length > 1 ? `Post ${i + 1}: ${r.error}` : r.error || "Schedule failed."); return; }
      setStatus(all[i].id, "scheduled");
    }
    setBusy("");
    flash(all.length > 1 ? `${all.length} posts scheduled ✓` : "Scheduled ✓");
    router.refresh();
  }

  async function addBlock() {
    setBusy("add");
    const r = await createBlankPost();
    setBusy("");
    if ("error" in r) { flash(r.error); return; }
    const blank: PostData = { id: r.id, title: "", slug: r.slug, excerpt: null, body: "", cover_image: null, author: "TABOR", type: "static", brief: null, targets: null, status: "draft", scheduled_for: null };
    setBlocks((b) => [...b, { post: blank, media: [] }]);
    setStatuses((m) => ({ ...m, [r.id]: "draft" }));
  }

  async function removeBlock(id: string) {
    await discardPost(id);
    handles.current.delete(id);
    setBlocks((b) => b.filter((x) => x.post.id !== id));
  }

  const many = blocks.length > 1;

  return (
    <div style={{ display: "grid", gap: 22, maxWidth: 860 }}>
      {blocks.map((b, i) => (
        <PostBlock
          key={b.post.id}
          post={b.post}
          media={b.media}
          index={i}
          showHeader={many}
          status={statuses[b.post.id] ?? b.post.status}
          register={(h) => handles.current.set(b.post.id, h)}
          onRemove={i > 0 ? () => removeBlock(b.post.id) : undefined}
          flash={flash}
        />
      ))}

      {/* the "+" — add another post to the queue */}
      <button type="button" onClick={addBlock} disabled={!!busy} style={{ border: `1px dashed ${GOLD}44`, background: "rgba(201,169,97,0.04)", borderRadius: 16, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 20, color: GOLD, lineHeight: 1 }}>+</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#9A948A", letterSpacing: "0.12em", textTransform: "uppercase" }}>{busy === "add" ? "Adding…" : "Add another post"}</span>
      </button>

      {/* actions for the whole queue */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", position: "sticky", bottom: 0, background: "linear-gradient(180deg, transparent, rgba(10,10,14,0.94) 30%)", padding: "14px 0 6px", zIndex: 5 }}>
        <button type="button" onClick={doGenerate} disabled={!!busy} style={ghost}>{busy === "save" ? "Generating…" : "Generate"}</button>
        <button type="button" onClick={doSchedule} disabled={!!busy} style={{ ...ghost, color: GOLD, borderColor: `${GOLD}77` }}>{busy === "schedule" ? "Scheduling…" : "🕒 Schedule"}</button>
        <button type="button" onClick={doPublishNow} disabled={!!busy} style={gold}>{busy === "publish" ? "Publishing…" : "Publish now"}</button>
        {msg && <span style={{ fontFamily: MONO, fontSize: 11, color: msg.includes("✓") ? "#7BBF7B" : "#C03A3A", letterSpacing: "0.04em" }}>{msg}</span>}
        {many && <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.08em", marginLeft: "auto" }}>{blocks.length} POSTS IN THE QUEUE</span>}
      </div>
    </div>
  );
}

function PostBlock({ post, media, index, showHeader, status, register, onRemove, flash }: {
  post: PostData; media: MediaCard[]; index: number; showHeader: boolean; status: string;
  register: (h: BlockHandle) => void; onRemove?: () => void; flash: (m: string) => void;
}) {
  const [title, setTitle] = useState(post.title === "Untitled post" ? "" : post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [body, setBody] = useState(post.body ?? "");
  const [author, setAuthor] = useState(post.author ?? "TABOR");
  const [type, setType] = useState(post.type ?? "static");
  const [brief, setBrief] = useState(post.brief ?? "");
  const [targets, setTargets] = useState<PostTargets>(post.targets ?? { app: true, email: false, blog: true, instagram: false, tiktok: false });
  const pad3 = (arr: Slot[]) => { const c = [...arr]; while (c.length < 3) c.push(null); return c; };
  const [cards, setCards] = useState<Slot[]>(pad3(media.length ? media : []));
  const [scheduleAt, setScheduleAt] = useState(toLocalInput(post.scheduled_for));
  const [drafting, setDrafting] = useState(false);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const collectMedia = (): MediaCard[] => cards.filter((m): m is MediaCard => !!m && m.url !== "__uploading__");

  // re-register every render so the parent always collects the latest state
  useEffect(() => {
    register({
      collect: () => ({ id: post.id, title, slug, excerpt, body, cover_image: post.cover_image ?? "", author, type, brief, targets, media: collectMedia() }),
      scheduleAt: () => (scheduleAt ? new Date(scheduleAt).toISOString() : null),
      uploading: () => cards.some((m) => m?.url === "__uploading__"),
    });
  });

  async function doDraft() {
    if (cards.some((m) => m?.url === "__uploading__")) { flash("Wait for uploads to finish."); return; }
    if (!brief.trim()) { flash("Add a brief first."); return; }
    setDrafting(true);
    await savePost({ id: post.id, title, slug, excerpt, body, cover_image: post.cover_image ?? "", author, type, brief, targets, media: collectMedia() });
    const r = await draftFromBrief(post.id);
    setDrafting(false);
    if (!r.ok) { flash(r.error || "Draft failed."); return; }
    if (r.draft) { setTitle(r.draft.title); setExcerpt(r.draft.excerpt ?? ""); setBody(r.draft.body); }
    flash("Drafted ✓ Review it, then publish or schedule");
  }

  const kindOf = (f: File) => (f.type.includes("gif") ? "gif" : f.type.startsWith("video") ? "video" : "image");

  async function uploadTo(i: number, file: File) {
    const sb = supabaseBrowser();
    if (!sb) { flash("Storage unavailable."); return; }
    setCards((c) => { const n = [...c]; n[i] = { kind: kindOf(file), url: "__uploading__", poster_url: null }; return n; });
    const ticket = await createMediaUpload(file.name);
    if ("error" in ticket) { flash(ticket.error); setCards((c) => { const n = [...c]; n[i] = null; return n; }); return; }
    const { error } = await sb.storage.from("content-media").uploadToSignedUrl(ticket.path, ticket.token, file);
    if (error) { flash(error.message); setCards((c) => { const n = [...c]; n[i] = null; return n; }); return; }
    setCards((c) => { const n = [...c]; n[i] = { kind: kindOf(file), url: ticket.publicUrl, poster_url: null }; return n; });
  }
  const clearCard = (i: number) => setCards((c) => { const n = [...c]; n[i] = null; if (fileRefs.current[i]) fileRefs.current[i]!.value = ""; return n; });
  const move = (i: number, d: number) => setCards((c) => { const n = [...c]; const j = i + d; if (j < 0 || j >= n.length) return c; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const addCard = () => setCards((c) => [...c, null]);
  const toggleTarget = (k: keyof PostTargets) => setTargets((t) => ({ ...t, [k]: !t[k] }));

  const statusChip = status === "published" ? ["#7BBF7B", "● LIVE"] : status === "scheduled" ? [GOLD, "🕒 SCHEDULED"] : status === "review" ? [GOLD, "● IN REVIEW"] : ["#8A847A", "○ DRAFT"];

  return (
    <div style={{ display: "grid", gap: 18, ...(showHeader ? { border: `1px solid ${GOLD}22`, borderRadius: 18, padding: 16, background: "rgba(201,169,97,0.025)" } : {}) }}>
      {showHeader && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.18em" }}>POST {index + 1}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 9, color: statusChip[0], letterSpacing: "0.08em" }}>{statusChip[1]}</span>
            {onRemove && <button type="button" onClick={onRemove} title="Remove this post" style={{ ...miniBtn, color: "#ff8c8c", borderColor: "rgba(192,58,58,0.4)" }}>× Remove</button>}
          </span>
        </div>
      )}

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

      {/* destinations + schedule */}
      <div style={card}>
        <label style={lbl}>Publish to</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {([["app", "📱 App feed"], ["email", "✉️ Email"], ["blog", "🌐 Website blog"], ["instagram", "Instagram"], ["tiktok", "TikTok"]] as [keyof PostTargets, string][]).map(([k, label]) => {
            const on = targets[k];
            return (
              <button key={k} type="button" onClick={() => toggleTarget(k)} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.04em", padding: "11px 16px", borderRadius: 12, cursor: "pointer", color: on ? "#1a1408" : "#C3BDB1", fontWeight: on ? 700 : 400, background: on ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.06)", border: `1px solid ${on ? "transparent" : `${GOLD}33`}` }}>{on ? "✓ " : ""}{label}</button>
            );
          })}
        </div>
        {targets.email && <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.06em", marginTop: 10 }}>EMAIL GOES OUT ON PUBLISH, ONLY TO PEOPLE WHO OPTED INTO MARKETING.</div>}

        <div style={{ borderTop: "1px solid rgba(201,169,97,0.12)", marginTop: 16, paddingTop: 14 }}>
          <label style={lbl}>Schedule for (optional) — your local time</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} style={{ ...inp, maxWidth: 240, colorScheme: "dark" }} />
            {scheduleAt && <button type="button" onClick={() => setScheduleAt("")} style={{ ...miniBtn, padding: "6px 10px" }}>Clear</button>}
            {status === "scheduled" && post.scheduled_for && (
              <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.08em" }}>QUEUED · {new Date(post.scheduled_for).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
            )}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.06em", marginTop: 8 }}>SET A TIME AND HIT SCHEDULE. INSTAGRAM + TIKTOK FIRE VIA ZERNIO AT THAT MOMENT; APP FEED + BLOG GO LIVE AT THE SAME TIME.</div>
        </div>
      </div>

      {!showHeader && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: statusChip[0], letterSpacing: "0.08em" }}>{statusChip[1]}</span>
        </div>
      )}
    </div>
  );
}
