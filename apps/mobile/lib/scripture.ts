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

export interface BibleVersion { code: string; name: string; abbrev: string; language: string }
let _versions: BibleVersion[] | null = null;
export async function getVersions(): Promise<BibleVersion[]> {
  if (_versions) return _versions;
  const { data } = await supabase.from("bible_versions").select("code, name, abbrev, language").order("sort", { ascending: true });
  _versions = (data as BibleVersion[])?.length ? (data as BibleVersion[]) : [{ code: "kjv", name: "King James Version", abbrev: "KJV", language: "English" }];
  return _versions;
}

/** A chapter in the chosen version. If that version doesn't carry the book (e.g. the
 *  Deuterocanon in a Protestant translation), falls back to the KJV and flags it. */
export async function getChapter(bookOrder: number, chapter: number, version = "kjv"): Promise<{ book: string; verses: Verse[]; fellBack: boolean }> {
  let { data } = await supabase.from("bible_verses").select("book, verse, text").eq("book_order", bookOrder).eq("chapter", chapter).eq("version", version).order("verse", { ascending: true });
  let fellBack = false;
  if ((!data || data.length === 0) && version !== "kjv") {
    fellBack = true;
    ({ data } = await supabase.from("bible_verses").select("book, verse, text").eq("book_order", bookOrder).eq("chapter", chapter).eq("version", "kjv").order("verse", { ascending: true }));
  }
  return { book: (data?.[0]?.book as string) ?? "", verses: (data ?? []).map((v) => ({ verse: v.verse, text: v.text })), fellBack };
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

// ---- continue where you left off ----
export interface LastRead { order: number; chapter: number; book: string }
export async function setLastRead(userId: string, pos: LastRead): Promise<void> {
  await supabase.from("profiles").update({ last_read: pos }).eq("user_id", userId);
}
export async function getLastRead(userId: string): Promise<LastRead | null> {
  const { data } = await supabase.from("profiles").select("last_read").eq("user_id", userId).maybeSingle();
  return (data?.last_read as LastRead) ?? null;
}
