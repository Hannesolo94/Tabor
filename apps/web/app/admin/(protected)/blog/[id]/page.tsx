import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { deletePost, type PostTargets, type MediaCard } from "../actions";
import { PostComposer } from "../PostComposer";
import { GOLD, MONO, CINZEL } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await supabaseServer();
  const [{ data: p }, { data: mediaRows }] = await Promise.all([
    sb.from("posts").select("*").eq("id", id).maybeSingle(),
    sb.from("post_media").select("kind, url, poster_url").eq("post_id", id).order("sort", { ascending: true }),
  ]);
  if (!p) notFound();
  const media: MediaCard[] = (mediaRows ?? []).map((m) => ({ kind: m.kind, url: m.url, poster_url: m.poster_url }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/admin/blog" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>← CONTENT</Link>
        {p.status === "published" && <Link href={`/blog/${p.slug}`} target="_blank" style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.12em", textDecoration: "none" }}>VIEW ON SITE ↗</Link>}
      </div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: "14px 0 20px" }}>Compose</h1>

      <PostComposer
        post={{ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, body: p.body, cover_image: p.cover_image, author: p.author, type: p.type, brief: p.brief, targets: (p.targets ?? null) as PostTargets | null, status: p.status }}
        media={media}
      />

      <form action={deletePost} style={{ marginTop: 30, paddingTop: 16, borderTop: "1px solid rgba(192,58,58,0.25)" }}>
        <input type="hidden" name="id" value={p.id} />
        <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C03A3A", background: "rgba(192,58,58,0.06)", border: "1px solid rgba(192,58,58,0.4)", borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>Delete post</button>
      </form>
    </div>
  );
}
