// Scripture engine: full-Bible reader, reading plans + progress, prayer journal,
// verse bookmarks (reuses the bookmarks table).
import { supabase } from "./supabase";

export interface BookInfo { book_order: number; book: string; chapters: number }
export interface Verse { verse: number; text: string }
export interface PlanEntry { day: number; title: string; book: string; chapter: number; reflection?: string }
export interface Plan { id: string; title: string; subtitle: string | null; days: number; seeker: boolean; entries: PlanEntry[] }
export interface Prayer { id: string; body: string; answered: boolean; created_at: string }

let _books: BookInfo[] | null = null;
export async function getBooks(): Promise<BookInfo[]> {
  if (_books) return _books;
  // reads the 66-row bible_books view, not the ~31k verse rows
  const { data } = await supabase.from("bible_books").select("book_order, book, chapters").order("book_order");
  _books = (data as BookInfo[]) ?? [];
  return _books;
}

export async function getChapter(bookOrder: number, chapter: number): Promise<{ book: string; verses: Verse[] }> {
  const { data } = await supabase.from("bible_verses").select("book, verse, text").eq("book_order", bookOrder).eq("chapter", chapter).order("verse", { ascending: true });
  return { book: (data?.[0]?.book as string) ?? "", verses: (data ?? []).map((v) => ({ verse: v.verse, text: v.text })) };
}

export async function bookOrderFor(name: string): Promise<number | null> {
  const books = await getBooks();
  return books.find((b) => b.book === name)?.book_order ?? null;
}

export async function searchVerses(q: string): Promise<{ ref: string; book_order: number; chapter: number; text: string }[]> {
  if (q.trim().length < 3) return [];
  const { data } = await supabase.from("bible_verses").select("book, book_order, chapter, verse, text").ilike("text", `%${q.trim()}%`).limit(40);
  return (data ?? []).map((v) => ({ ref: `${v.book} ${v.chapter}:${v.verse}`, book_order: v.book_order, chapter: v.chapter, text: v.text }));
}

// ---- plans ----
export async function getPlans(): Promise<Plan[]> {
  const { data } = await supabase.from("reading_plans").select("*").order("sort", { ascending: true });
  return (data as Plan[]) ?? [];
}
export async function getPlan(id: string): Promise<Plan | null> {
  const { data } = await supabase.from("reading_plans").select("*").eq("id", id).maybeSingle();
  return (data as Plan) ?? null;
}
export async function getProgress(userId: string): Promise<Record<string, number>> {
  const { data } = await supabase.from("plan_progress").select("plan_id, day").eq("user_id", userId);
  const m: Record<string, number> = {};
  for (const r of data ?? []) m[r.plan_id] = r.day;
  return m;
}
export async function setPlanDay(userId: string, planId: string, day: number): Promise<void> {
  await supabase.from("plan_progress").upsert({ user_id: userId, plan_id: planId, day, updated_at: new Date().toISOString() });
}

// ---- prayers ----
export async function listPrayers(userId: string): Promise<Prayer[]> {
  const { data } = await supabase.from("prayers").select("id, body, answered, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  return (data as Prayer[]) ?? [];
}
export async function addPrayer(userId: string, body: string): Promise<void> {
  await supabase.from("prayers").insert({ user_id: userId, body });
}
export async function togglePrayer(id: string, answered: boolean): Promise<void> {
  await supabase.from("prayers").update({ answered }).eq("id", id);
}

// ---- bookmarks (verse refs) ----
export async function getBookmarks(userId: string): Promise<string[]> {
  const { data } = await supabase.from("bookmarks").select("ref").eq("user_id", userId);
  return (data ?? []).map((b) => b.ref);
}
export async function toggleBookmark(userId: string, ref: string, on: boolean): Promise<void> {
  if (on) await supabase.from("bookmarks").upsert({ user_id: userId, ref });
  else await supabase.from("bookmarks").delete().eq("user_id", userId).eq("ref", ref);
}
export async function setBookmarks(userId: string, refs: string[], on: boolean): Promise<void> {
  if (!refs.length) return;
  if (on) await supabase.from("bookmarks").upsert(refs.map((ref) => ({ user_id: userId, ref })), { onConflict: "user_id,ref" });
  else await supabase.from("bookmarks").delete().eq("user_id", userId).in("ref", refs);
}

// ---- highlights (colored verse refs) ----
export interface Highlight { ref: string; color: string }
export async function getHighlights(userId: string): Promise<Highlight[]> {
  const { data } = await supabase.from("highlights").select("ref, color").eq("user_id", userId);
  return (data as Highlight[]) ?? [];
}
export async function setHighlights(userId: string, refs: string[], color: string): Promise<void> {
  if (!refs.length) return;
  await supabase.from("highlights").upsert(refs.map((ref) => ({ user_id: userId, ref, color })), { onConflict: "user_id,ref" });
}
export async function removeHighlights(userId: string, refs: string[]): Promise<void> {
  if (!refs.length) return;
  await supabase.from("highlights").delete().eq("user_id", userId).in("ref", refs);
}
