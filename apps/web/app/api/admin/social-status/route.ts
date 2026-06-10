// Live social publishing status for a post (polls Zernio). Powers the badge in the Studio.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getSocialStatus } from "@/lib/zernio";

export async function GET(req: Request) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ state: "unknown", platforms: [] }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ state: "none", platforms: [] });
  const { data: post } = await sb.from("posts").select("social_post_id").eq("id", id).maybeSingle();
  if (!post?.social_post_id) return NextResponse.json({ state: "none", platforms: [] });

  const status = await getSocialStatus(post.social_post_id);
  return NextResponse.json(status ?? { state: "unknown", platforms: [] });
}
