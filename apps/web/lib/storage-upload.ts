// Signed direct-to-Storage upload tickets. The browser uploads media straight to
// Supabase Storage with the returned token, bypassing the Vercel/server-action body
// limits. Server-only (service role). Used by the Content Studio, Ad Studio, and
// the Brand Kit design-file library.
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface UploadTicket { path: string; token: string; publicUrl: string }

/** Create a signed upload URL for `bucket`, optionally under `prefix/`. publicUrl is
 *  only meaningful for public buckets. */
export async function createUploadTicket(name: string, bucket: string, prefix = ""): Promise<UploadTicket | { error: string }> {
  const admin = supabaseAdmin();
  const ext = name.includes(".") ? name.split(".").pop() : "bin";
  const dir = prefix ? `${prefix.replace(/\/+$/, "")}/` : "";
  const path = `${dir}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not start the upload." };
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return { path: data.path, token: data.token, publicUrl: `${base}/storage/v1/object/public/${bucket}/${data.path}` };
}
