"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

export interface PostTargets { app: boolean; email: boolean; blog: boolean; instagram: boolean; tiktok: boolean }
export interface MediaCard { kind: string; url: string; poster_url: string | null }

/** Signed upload URL so the browser uploads media DIRECTLY to the public content-media bucket. */
export async function createMediaUpload(name: string): Promise<{ path: string; token: string; publicUrl: string } | { error: string }> {
  const admin = supabaseAdmin();
  const ext = name.includes(".") ? name.split(".").pop() : "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await admin.storage.from("content-media").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not start the upload." };
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return { path: data.path, token: data.token, publicUrl: `${base}/storage/v1/object/public/content-media/${data.path}` };
}

/** Full save of a post: fields + type + brief + targets + the ordered media cards. */
export async function savePost(input: {
  id: string; title: string; slug: string; excerpt: string; body: string; cover_image: string;
  author: string; type: string; brief: string; targets: PostTargets; media: MediaCard[];
}): Promise<void> {
  const sb = await supabaseServer();
  await sb.from("posts").update({
    title: input.title.trim(),
    slug: slugify(input.slug || input.title),
    excerpt: input.excerpt || null,
    body: input.body ?? "",
    cover_image: input.cover_image || input.media[0]?.url || null,
    author: input.author || "TABOR",
    type: input.type,
    brief: input.brief || null,
    targets: input.targets,
    updated_at: new Date().toISOString(),
  }).eq("id", input.id);
  await sb.from("post_media").delete().eq("post_id", input.id);
  if (input.media.length) {
    await sb.from("post_media").insert(input.media.map((m, i) => ({ post_id: input.id, kind: m.kind, url: m.url, poster_url: m.poster_url, sort: i })));
  }
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${input.id}`);
  revalidatePath("/blog");
}

/** Publish to the chosen destinations (blog + app feed here; email send is its own action). */
export async function publishPost(id: string): Promise<void> {
  const sb = await supabaseServer();
  const { data: post } = await sb.from("posts").select("published_at, app_published_at, targets").eq("id", id).maybeSingle();
  if (!post) return;
  const targets = (post.targets ?? {}) as PostTargets;
  const patch: Record<string, unknown> = { status: "published", updated_at: new Date().toISOString() };
  if (!post.published_at) patch.published_at = new Date().toISOString();
  if (targets.app && !post.app_published_at) patch.app_published_at = new Date().toISOString();
  await sb.from("posts").update(patch).eq("id", id);
  await logAudit("post.publish", "post", id, { targets });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
}

export async function createPost(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const sb = await supabaseServer();
  let slug = slugify(title);
  for (let i = 2; i < 50; i++) {
    const { data } = await sb.from("posts").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${slugify(title)}-${i}`;
  }
  const { data } = await sb.from("posts").insert({ title, slug }).select("id").single();
  revalidatePath("/admin/blog");
  if (data?.id) redirect(`/admin/blog/${data.id}`);
}

export async function updatePost(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "draft");
  const sb = await supabaseServer();
  const patch: Record<string, unknown> = {
    title: String(formData.get("title") ?? "").trim(),
    slug: slugify(String(formData.get("slug") ?? "")),
    excerpt: String(formData.get("excerpt") ?? "") || null,
    body: String(formData.get("body") ?? ""),
    cover_image: String(formData.get("cover_image") ?? "") || null,
    author: String(formData.get("author") ?? "TABOR") || "TABOR",
    status,
    updated_at: new Date().toISOString(),
  };
  // stamp publish time the first time it goes live
  if (status === "published") {
    const { data: cur } = await sb.from("posts").select("published_at").eq("id", id).maybeSingle();
    if (!cur?.published_at) patch.published_at = new Date().toISOString();
  }
  await sb.from("posts").update(patch).eq("id", id);
  await logAudit("post.update", "post", id, { status });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
}

export async function deletePost(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sb = await supabaseServer();
  await sb.from("posts").delete().eq("id", id);
  await logAudit("post.delete", "post", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}
