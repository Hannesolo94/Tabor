"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

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
