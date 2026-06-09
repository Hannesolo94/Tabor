"use client";

// Design-file library for the admin Brand Kit. Stores store-SKU / product source
// art plus freeform design files (AI, PSD, PDF, print-ready PNG). Presentation +
// the two server actions only.
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createUploadTicket, recordDesignFile, deleteDesignFile } from "./actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export interface DesignFile {
  id: string;
  name: string;
  path: string;
  mime: string | null;
  size_bytes: number | null;
  product_sku: string | null;
  scope: string | null;
  folder: string | null;
  notes: string | null;
  created_at: string;
  url: string | null;
}

type Filter =
  | { kind: "all" }
  | { kind: "folder"; value: string }
  | { kind: "product"; value: string };

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "20px 22px" };
const listCardStyle: React.CSSProperties = { ...cardStyle, padding: "8px 16px 14px" };

const goldButton: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer" };
const inputStyle: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: "1px solid rgba(201,169,97,0.2)", borderRadius: 10, padding: "9px 11px" };

const th: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", padding: "12px 8px", fontWeight: 400 };
const td: React.CSSProperties = { padding: "11px 8px", fontFamily: BODY, fontSize: 13, color: "#C3BDB1", verticalAlign: "middle" };

function pillStyle(active: boolean): React.CSSProperties {
  return { fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 999, cursor: "pointer", color: active ? "#1a1408" : GOLD, fontWeight: active ? 700 : 400, background: active ? "linear-gradient(180deg, #f0d89a, #c9a961)" : "rgba(201,169,97,0.08)", border: `1px solid ${active ? "transparent" : "rgba(201,169,97,0.3)"}` };
}

function humanizeBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function extOf(file: DesignFile): string {
  const fromName = file.name.includes(".") ? file.name.split(".").pop() : "";
  const fromMime = file.mime ? file.mime.split("/").pop() : "";
  return (fromName || fromMime || "file").toUpperCase().slice(0, 4);
}

export function DesignFiles({ files, products }: { files: DesignFile[]; products: { sku: string; name: string }[] }) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState("");
  const [scopeVal, setScopeVal] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function doUpload(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabaseBrowser();
    if (!file || !sb) { setErr("Pick a file first."); return; }
    setUploading(true); setErr(null);
    try {
      const ticket = await createUploadTicket(file.name);
      if ("error" in ticket) { setErr(ticket.error); setUploading(false); return; }
      const { error } = await sb.storage.from("design-files").uploadToSignedUrl(ticket.path, ticket.token, file);
      if (error) { setErr(error.message); setUploading(false); return; }
      const sku = scopeVal.startsWith("sku:") ? scopeVal.slice(4) : null;
      const scope = scopeVal.startsWith("scope:") ? scopeVal.slice(6) : null;
      await recordDesignFile({ name: file.name, path: ticket.path, mime: file.type || null, size: file.size, sku, scope, folder: folder || null, notes: notes || null });
      setFile(null); setFolder(""); setScopeVal(""); setNotes(""); if (fileRef.current) fileRef.current.value = "";
      setUploading(false); router.refresh();
    } catch (ex) { setErr(ex instanceof Error ? ex.message : "Upload failed."); setUploading(false); }
  }

  const productName = (sku: string | null): string | null => {
    if (!sku) return null;
    return products.find((p) => p.sku === sku)?.name ?? sku;
  };

  const folders: string[] = Array.from(
    new Set(files.map((f) => f.folder).filter((f): f is string => !!f))
  ).sort();

  const usedSkus: string[] = Array.from(
    new Set(files.map((f) => f.product_sku).filter((s): s is string => !!s))
  );

  const visible = files.filter((f) => {
    if (filter.kind === "all") return true;
    if (filter.kind === "folder") return f.folder === filter.value;
    return f.product_sku === filter.value;
  });

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 18, color: "#E8E2D5", margin: 0 }}>Design files</h2>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "5px 0 0" }}>Source artwork for your products and brand. AI, PSD, PDF, print-ready PNG.</p>
      </div>

      {/* Upload */}
      <form onSubmit={doUpload} className="admin-card" style={{ ...cardStyle, marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
          <span style={goldButton}>Choose file</span>
          <span style={{ fontFamily: BODY, fontSize: 12.5, color: file ? "#E8E2D5" : "#8A847A", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file ? file.name : "No file chosen"}</span>
        </label>
        <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Folder (optional, e.g. Tees, Logos)" style={{ ...inputStyle, minWidth: 200 }} />
        <select value={scopeVal} onChange={(e) => setScopeVal(e.target.value)} style={{ ...inputStyle, minWidth: 190 }}>
          <option value="">No product</option>
          <option value="scope:apparel">All apparel</option>
          <option value="scope:gear">All gear</option>
          <optgroup label="Specific product">
            {products.map((p) => (<option key={p.sku} value={`sku:${p.sku}`}>{p.name}</option>))}
          </optgroup>
        </select>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes / print instructions — placement, colours, sizing, anything I should know…" style={{ ...inputStyle, width: "100%", minHeight: 60, resize: "vertical" }} />
        <button type="submit" disabled={uploading || !file} style={{ ...goldButton, opacity: uploading || !file ? 0.6 : 1 }}>{uploading ? "Uploading…" : "Upload design"}</button>
        {err && <span style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", width: "100%" }}>{err}</span>}
      </form>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <button type="button" onClick={() => setFilter({ kind: "all" })} style={pillStyle(filter.kind === "all")}>All</button>
        {folders.map((folder) => (
          <button
            key={`folder:${folder}`}
            type="button"
            onClick={() => setFilter({ kind: "folder", value: folder })}
            style={pillStyle(filter.kind === "folder" && filter.value === folder)}
          >
            {folder}
          </button>
        ))}
        {usedSkus.map((sku) => (
          <button
            key={`product:${sku}`}
            type="button"
            onClick={() => setFilter({ kind: "product", value: sku })}
            style={pillStyle(filter.kind === "product" && filter.value === sku)}
          >
            {productName(sku)}
          </button>
        ))}
      </div>

      {/* File list */}
      <div className="admin-card" style={listCardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["File", "Name", "Tag", "Size", "Date", "", ""].map((h, i) => (
              <th key={i} style={{ ...th, textAlign: i >= 3 && i <= 4 ? "right" : "left" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {visible.map((f) => {
              const isImage = f.mime?.startsWith("image/") && f.url;
              const tagFolder = f.folder;
              const tagProduct = productName(f.product_sku);
              const tagScope = f.scope === "apparel" ? "All Apparel" : f.scope === "gear" ? "All Gear" : null;
              return (
                <tr key={f.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ ...td, width: 48 }}>
                    {isImage ? (
                      <img src={f.url ?? undefined} alt={f.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 8, background: "rgba(201,169,97,0.08)", border: "1px solid rgba(201,169,97,0.2)", fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.04em" }}>{extOf(f)}</span>
                    )}
                  </td>
                  <td style={{ ...td, color: "#E8E2D5", fontWeight: 600 }}>{f.name}{f.notes ? <div style={{ fontFamily: BODY, fontSize: 11, color: "#8A847A", fontWeight: 400, marginTop: 3, maxWidth: 380, whiteSpace: "normal", lineHeight: 1.4 }}>{f.notes}</div> : null}</td>
                  <td style={td}>
                    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
                      {tagFolder && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 8, color: GOLD, border: "1px solid rgba(201,169,97,0.4)", background: "rgba(201,169,97,0.08)" }}>{tagFolder}</span>}
                      {tagScope && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 8, color: "#C9A961", border: "1px solid rgba(201,169,97,0.4)", background: "rgba(201,169,97,0.08)" }}>{tagScope}</span>}
                      {tagProduct && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 8, color: "#9FC9D6", border: "1px solid rgba(159,201,214,0.35)", background: "rgba(159,201,214,0.08)" }}>{tagProduct}</span>}
                      {!tagFolder && !tagProduct && !tagScope && <span style={{ color: "#6F6A60" }}>—</span>}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontSize: 11, color: "#9A948A" }}>{humanizeBytes(f.size_bytes)}</td>
                  <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontSize: 11, color: "#9A948A" }}>{new Date(f.created_at).toLocaleDateString()}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noreferrer" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: GOLD, textDecoration: "none", padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(201,169,97,0.35)" }}>Download</a>
                    ) : (
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5A554C", padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>Download</span>
                    )}
                  </td>
                  <td style={{ ...td, textAlign: "right", width: 60 }}>
                    <form action={deleteDesignFile} style={{ display: "inline" }}>
                      <input type="hidden" name="id" value={f.id} />
                      <input type="hidden" name="path" value={f.path} />
                      <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#C03A3A", background: "transparent", border: "1px solid rgba(192,58,58,0.35)", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...td, color: "#8A847A", fontFamily: BODY, padding: "18px 8px" }}>
                  {files.length === 0
                    ? "No design files yet. Upload your product artwork and brand source files here."
                    : "No files match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
