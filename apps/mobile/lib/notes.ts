import { supabase } from "./supabase";

export interface Note { id: string; cat: string; title: string | null; body: string; ref: string | null; created_at: string }

export async function listNotes(userId: string): Promise<Note[]> {
  const { data } = await supabase.from("notes").select("id, cat, title, body, ref, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  return data ?? [];
}
export async function addNote(userId: string, n: { cat: string; title?: string; body: string; ref?: string }) {
  return supabase.from("notes").insert({ user_id: userId, cat: n.cat, title: n.title ?? null, body: n.body, ref: n.ref ?? null });
}
export async function deleteNote(id: string) {
  return supabase.from("notes").delete().eq("id", id);
}
