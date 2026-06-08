// Profile editing: avatar upload (public 'avatars' bucket) + name/handle/bio.
import { decodeBase64 } from "tweetnacl-util";
import { supabase } from "./supabase";

export async function uploadAvatar(userId: string, base64: string, ext: string): Promise<string | null> {
  const bytes = decodeBase64(base64);
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, bytes, { contentType: ext === "png" ? "image/png" : "image/jpeg", upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`; // bust cache after re-upload
}

export async function updateProfile(userId: string, fields: { name?: string; handle?: string; bio?: string | null; avatar_url?: string | null }): Promise<{ error?: string }> {
  const { error } = await supabase.from("profiles").update(fields).eq("user_id", userId);
  return { error: error?.message };
}
