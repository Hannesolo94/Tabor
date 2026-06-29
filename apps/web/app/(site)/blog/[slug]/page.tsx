import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog-db";
import { Markdown } from "@/components/site/Markdown";
import { GOLD, MONO, METAL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) return { title: "TABOR" };
  return {
    title: p.title,
    description: p.excerpt ?? p.body.slice(0, 155),
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title: `${p.title} · TABOR`, description: p.excerpt ?? undefined, type: "article", images: p.cover_image ? [{ url: p.cover_image }] : undefined },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) notFound();

  return (
    <div style={{ background: "#0A0A0A", minHeight: "70vh", padding: "50px 24px 90px" }}>
      <article style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/blog" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.14em", textDecoration: "none" }}>← THE SCROLL</Link>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.16em", margin: "22px 0 8px" }}>{(p.published_at ?? p.scheduled_for) ? new Date((p.published_at ?? p.scheduled_for) as string).toISOString().slice(0, 10) : ""} · {p.author || "TABOR"}</div>
        <h1 style={{ fontFamily: METAL, fontSize: "clamp(34px,6vw,58px)", color: "#E8E2D5", margin: "0 0 18px", lineHeight: 1 }}>{p.title}</h1>
        {p.cover_image && <div style={{ aspectRatio: "16/9", background: `#15151A url(${p.cover_image}) center/cover`, borderRadius: 18, border: "1px solid rgba(201,169,97,0.16)", boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)", marginBottom: 26 }} />}
        {p.excerpt && <p style={{ fontFamily: BODY, fontSize: 18, color: "#E8E2D5", lineHeight: 1.7, marginBottom: 24, fontStyle: "italic" }}>{p.excerpt}</p>}
        <Markdown body={p.body} />
      </article>
    </div>
  );
}
