"use client";

// Ad creatives editor: each creative = media cards + ad copy (hook, primary text,
// headline, CTA, link) + format + status (draft -> review -> ready). "+" adds more.
// AI drafts the copy from a brief + the uploaded media, same flow as the Content Studio.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createAdMediaUpload, saveCreative, addCreative, deleteCreative, draftAdFromBrief, type AdMediaCard } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export interface CreativeData {
  id: string; title: string; format: string; hook: string | null; primary_text: string | null;
  headline: string | null; cta: string | null; link_url: string | null; brief: string | null;
  status: string; media: AdMediaCard[];
}

const FORMATS = ["static", "carousel", "video", "reel", "gif", "mixed"];
const STATUSES: [string, string][] = [["draft", "#8A847A"], ["review", "#5B9BD5"], ["ready", "#7BBF7B"]];
type Slot = AdMediaCard | null;

const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "10px 12px", width: "100%" };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const card: React.CSSProperties = { border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const gold: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "10px 18px", cursor: "pointer" };
const miniBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 12, lineHeight: 1, color: "#E8E2D5", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "3px 7px", cursor: "pointer" };

export function AdCreatives({ campaignId, initial }: { campaignId: string; initial: CreativeData[] }) {
  const [items, setItems] = useState<CreativeData[]>(initial);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");

  async function add() {
    setAdding(true);
    const r = await addCreative(campaignId);
    setAdding(false);
    if ("error" in r) { setMsg(r.error); return; }
    setItems((a) => [...a, { id: r.id, title: "", format: "static", hook: null, primary_text: null, headline: null, cta: "Shop now", link_url: null, brief: null, status: "draft", media: [] }]);
  }

  async function remove(id: string) {
    await deleteCreative(id);
    setItems((a) => a.filter((x) => x.id !== id));
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 15, color: "#E8E2D5" }}>Creatives · {items.length}</div>
        {msg && <span style={{ fontFamily: MONO, fontSize: 10, color: msg.includes("✓") ? "#7BBF7B" : "#C03A3A" }}>{msg}</span>}
      </div>
      {items.map((cr, i) => (
        <Creative key={cr.id} data={cr} index={i} onRemove={() => remove(cr.id)} flash={setMsg} />
      ))}
      <button type="button" onClick={add} disabled={adding} style={{ border: `1px dashed ${GOLD}44`, background: "rgba(201,169,97,0.04)", borderRadius: 16, padding: "14px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 18, color: GOLD, lineHeight: 1 }}>+</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#9A948A", letterSpacing: "0.12em", textTransform: "uppercase" }}>{adding ? "Adding…" : "Add creative"}</span>
      </button>
    </div>
  );
}

function Creative({ data, index, onRemove, flash }: { data: CreativeData; index: number; onRemove: () => void; flash: (m: string) => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(data.title === "Untitled creative" ? "" : data.title);
  const [format, setFormat] = useState(data.format);
  const [hook, setHook] = useState(data.hook ?? "");
  const [primary, setPrimary] = useState(data.primary_text ?? "");
  const [headline, setHeadline] = useState(data.headline ?? "");
  const [cta, setCta] = useState(data.cta ?? "Shop now");
  const [link, setLink] = useState(data.link_url ?? "");
  const [brief, setBrief] = useState(data.brief ?? "");
  const [status, setStatus] = useState(data.status);
  const pad2 = (arr: Slot[]) => { const c = [...arr]; while (c.length < 2) c.push(null); return c; };
  const [cards, setCards] = useState<Slot[]>(pad2(data.media.length ? [...data.media] : []));
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const collectMedia = (): AdMediaCard[] => cards.filter((m): m is AdMediaCard => !!m && m.url !== "__uploading__");
  const kindOf = (f: File) => (f.type.includes("gif") ? "gif" : f.type.startsWith("video") ? "video" : "image");

  async function uploadTo(i: number, file: File) {
    const sb = supabaseBrowser();
    if (!sb) { flash("Storage unavailable."); return; }
    setCards((c) => { const n = [...c]; n[i] = { kind: kindOf(file), url: "__uploading__", poster_url: null }; return n; });
    const ticket = await createAdMediaUpload(file.name);
    if ("error" in ticket) { flash(ticket.error); setCards((c) => { const n = [...c]; n[i] = null; return n; }); return; }
    const { error } = await sb.storage.from("content-media").uploadToSignedUrl(ticket.path, ticket.token, file);
    if (error) { flash(error.message); setCards((c) => { const n = [...c]; n[i] = null; return n; }); return; }
    setCards((c) => { const n = [...c]; n[i] = { kind: kindOf(file), url: ticket.publicUrl, poster_url: null }; return n; });
  }

  const payload = () => ({ id: data.id, title, format, hook, primary_text: primary, headline, cta, link_url: link, brief, status, media: collectMedia() });

  async function doSave(nextStatus?: string) {
    if (cards.some((m) => m?.url === "__uploading__")) { flash("Wait for uploads to finish."); return; }
    setSaving(true);
    const s = nextStatus ?? status;
    await saveCreative({ ...payload(), status: s });
    if (nextStatus) setStatus(nextStatus);
    setSaving(false);
    flash("Saved ✓");
    setTimeout(() => flash(""), 2500);
    router.refresh();
  }

  async function doDraft() {
    if (!brief.trim()) { flash("Add a brief first."); return; }
    setDrafting(true);
    await saveCreative(payload());
    const r = await draftAdFromBrief(data.id);
    setDrafting(false);
    if (!r.ok) { flash(r.error || "Draft failed."); return; }
    if (r.copy) { setTitle(r.copy.title); setHook(r.copy.hook); setPrimary(r.copy.primary_text); setHeadline(r.copy.headline); setCta(r.copy.cta); setStatus("review"); }
    flash("Drafted ✓ Review the copy, then mark it ready");
  }

  const sColor = STATUSES.find(([k]) => k === status)?.[1] ?? "#8A847A";

  return (
    <div style={{ ...card, display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.18em" }}>CREATIVE {index + 1}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: sColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>● {status}</span>
          <button type="button" onClick={onRemove} title="Remove creative" style={{ ...miniBtn, color: "#ff8c8c", borderColor: "rgba(192,58,58,0.4)" }}>× Remove</button>
        </span>
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Creative name (internal), e.g. RK hoodie reel v1" style={{ ...inp, fontFamily: CINZEL, fontWeight: 700, fontSize: 16 }} />

      {/* brief + AI draft */}
      <div>
        <label style={lbl}>Brief — what is this ad selling, what angle</label>
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. 'Risen Knight hoodie, angle: armor for the modern knight, target men who lift'…" style={{ ...inp, minHeight: 54, resize: "vertical" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={doDraft} disabled={drafting} style={gold}>{drafting ? "Drafting…" : "✨ Draft ad copy"}</button>
        </div>
      </div>

      {/* media */}
      <div>
        <label style={lbl}>Media</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {cards.map((m, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 12, border: `1px ${m ? "solid" : "dashed"} ${GOLD}44`, overflow: "hidden", background: "rgba(15,15,20,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {m && m.url === "__uploading__" ? (
                <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD }}>UPLOADING…</span>
              ) : m ? (
                <>
                  {m.kind === "video"
                    ? <video src={m.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  <button type="button" onClick={() => setCards((c) => { const n = [...c]; n[i] = null; return n; })} title="Clear" style={{ ...miniBtn, position: "absolute", top: 5, right: 5, color: "#ff8c8c" }}>×</button>
                </>
              ) : (
                <label style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer" }}>
                  <input type="file" accept="image/*,video/*,image/gif" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadTo(i, f); }} style={{ display: "none" }} />
                  <span style={{ fontFamily: MONO, fontSize: 18, color: `${GOLD}99` }}>+</span>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: "#8A847A", letterSpacing: "0.06em" }}>MEDIA</span>
                </label>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setCards((c) => [...c, null])} style={{ aspectRatio: "1 / 1", borderRadius: 12, border: `1px dashed ${GOLD}33`, background: "rgba(201,169,97,0.04)", color: "#9A948A", fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em", cursor: "pointer" }}>+ CARD</button>
        </div>
      </div>

      {/* copy */}
      <div style={{ display: "grid", gap: 10 }}>
        <div><label style={lbl}>Hook (first line)</label><input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="The scroll-stopper." style={inp} /></div>
        <div><label style={lbl}>Primary text</label><textarea value={primary} onChange={(e) => setPrimary(e.target.value)} rows={4} placeholder="Body copy. Brand voice. No em-dashes." style={{ ...inp, resize: "vertical" }} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 10 }}>
          <div><label style={lbl}>Headline</label><input value={headline} onChange={(e) => setHeadline(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>CTA</label><input value={cta} onChange={(e) => setCta(e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Link</label><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://tabor.quest/product/…" style={inp} /></div>
        </div>
      </div>

      {/* format + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {FORMATS.map((t) => (
            <button key={t} type="button" onClick={() => setFormat(t)} style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 11px", borderRadius: 999, cursor: "pointer", color: format === t ? "#1a1408" : GOLD, fontWeight: format === t ? 700 : 400, background: format === t ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.08)", border: `1px solid ${format === t ? "transparent" : `${GOLD}4d`}` }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => doSave()} disabled={saving} style={{ ...miniBtn, padding: "9px 14px", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>{saving ? "Saving…" : "Save"}</button>
          {status !== "ready" && <button type="button" onClick={() => doSave("ready")} disabled={saving} style={gold}>Mark ready</button>}
          {status === "ready" && <button type="button" onClick={() => doSave("draft")} disabled={saving} style={{ ...miniBtn, padding: "9px 14px", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Back to draft</button>}
        </div>
      </div>
    </div>
  );
}
