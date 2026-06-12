// Public review submission. Inserts as 'pending' (moderated before showing) via
// the service role, plus any uploaded media rows. Media files are uploaded
// browser-direct to the review-media storage bucket first; we just record URLs.
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sameOrigin } from "@/lib/http";

interface Body {
  sku?: string;
  name?: string;
  email?: string;
  rating?: number;
  title?: string;
  body?: string;
  consent?: boolean;
  media?: { type?: string; url?: string }[];
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  let b: Body;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const name = (b.name ?? "").trim();
  const body = (b.body ?? "").trim();
  const rating = Math.min(5, Math.max(1, Math.round(Number(b.rating) || 0)));
  // only accept real http(s) media URLs (block javascript:/data: and other schemes)
  const media = Array.isArray(b.media) ? b.media.filter((m) => /^https?:\/\//i.test(String(m.url ?? ""))) : [];

  if (!name || !body || !rating) return NextResponse.json({ error: "name, rating and review are required" }, { status: 400 });
  // marketing-use consent is required when uploading media
  if (media.length && !b.consent) return NextResponse.json({ error: "consent required to upload media" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: review, error } = await sb
    .from("reviews")
    .insert({ sku: b.sku ?? null, name, email: b.email || null, rating, title: b.title || null, body, status: "pending", consent: !!b.consent })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (media.length) {
    await sb.from("review_media").insert(
      media.map((m) => ({ review_id: review.id, type: m.type === "video" ? "video" : "image", url: m.url! })),
    );
  }

  return NextResponse.json({ ok: true });
}
