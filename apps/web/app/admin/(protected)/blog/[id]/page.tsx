import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { updatePost, deletePost } from "../actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const { data: p } = await sb.from("posts").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "11px 13px", width: "100%" };
  const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/admin/blog" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>← BLOG</Link>
        {p.status === "published" && <Link href={`/blog/${p.slug}`} target="_blank" style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.12em", textDecoration: "none" }}>VIEW ON SITE ↗</Link>}
      </div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: "14px 0 20px" }}>Edit Post</h1>

      <form action={updatePost} style={{ display: "grid", gap: 14, maxWidth: 720 }}>
        <input type="hidden" name="id" value={p.id} />
        <div><label style={lbl}>Title</label><input name="title" defaultValue={p.title} style={inp} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Slug (URL)</label><input name="slug" defaultValue={p.slug} style={inp} /></div>
          <div><label style={lbl}>Author</label><input name="author" defaultValue={p.author ?? "TABOR"} style={inp} /></div>
        </div>
        <div><label style={lbl}>Cover image URL</label><input name="cover_image" defaultValue={p.cover_image ?? ""} placeholder="https://…" style={inp} /></div>
        <div><label style={lbl}>Excerpt (1-2 lines, shown in lists + SEO)</label><input name="excerpt" defaultValue={p.excerpt ?? ""} style={inp} /></div>
        <div>
          <label style={lbl}>Body — supports markdown: # heading, **bold**, *italic*, - bullets, &gt; quote, [link](url)</label>
          <textarea name="body" defaultValue={p.body} rows={18} style={{ ...inp, resize: "vertical", lineHeight: 1.6, fontFamily: "ui-monospace, monospace", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontFamily: MONO, fontSize: 11, color: "#C3BDB1" }}><span style={lbl}>Status</span>
            <select name="status" defaultValue={p.status} style={inp}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "12px 22px", cursor: "pointer", alignSelf: "end" }}>Save</button>
        </div>
      </form>

      <form action={deletePost} style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid rgba(192,58,58,0.25)" }}>
        <input type="hidden" name="id" value={p.id} />
        <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C03A3A", background: "none", border: "1px solid rgba(192,58,58,0.4)", padding: "10px 16px", cursor: "pointer" }}>Delete post</button>
      </form>
    </div>
  );
}
