// Cross-guild social: friends, DMs, guild create/browse/join, blocks. Wraps the
// SECURITY DEFINER RPCs so discovery works across any guild without exposing the
// whole profiles table.
import { supabase } from "./supabase";

export interface FriendRow { id: string; other_id: string; name: string | null; handle: string | null; cls: string | null; xp: number | null; status: string; direction: "incoming" | "outgoing" }
export interface SearchRow { user_id: string; name: string | null; handle: string | null; cls: string | null; xp: number | null }
export interface DmMsg { id: string; body: string | null; author_id: string | null; created_at: string }
export interface GuildRow { id: string; name: string; tag: string | null; open: boolean }

export async function ensureHandle(): Promise<string> { const { data } = await supabase.rpc("ensure_handle"); return (data as string) ?? ""; }
export async function searchUsers(q: string): Promise<SearchRow[]> { const { data } = await supabase.rpc("search_users", { q }); return (data as SearchRow[]) ?? []; }
export async function listFriends(): Promise<FriendRow[]> { const { data } = await supabase.rpc("list_friends"); return (data as FriendRow[]) ?? []; }
export async function sendFriendRequest(target: string): Promise<string> { const { data } = await supabase.rpc("send_friend_request", { target }); return (data as string) ?? "error"; }
export async function respondFriend(pId: string, accept: boolean): Promise<void> { await supabase.rpc("respond_friend_request", { p_id: pId, p_accept: accept }); }
export async function createGuild(name: string, tag: string): Promise<string | null> { const { data } = await supabase.rpc("create_guild", { p_name: name, p_tag: tag }); return (data as string) ?? null; }
export async function openDm(other: string): Promise<string | null> { const { data } = await supabase.rpc("open_dm", { other }); return (data as string) ?? null; }
export async function blockUser(other: string): Promise<void> { await supabase.rpc("block_user", { other }); }

export async function browseGuilds(): Promise<GuildRow[]> {
  const { data } = await supabase.from("guilds").select("id, name, tag, open").eq("open", true).order("created_at", { ascending: true });
  return (data as GuildRow[]) ?? [];
}
export async function joinGuild(guildId: string, userId: string): Promise<void> {
  await supabase.from("guild_members").upsert({ guild_id: guildId, user_id: userId, role: "member" }, { onConflict: "guild_id,user_id", ignoreDuplicates: true });
}
export async function myGuilds(userId: string): Promise<GuildRow[]> {
  const { data: gm } = await supabase.from("guild_members").select("guild_id").eq("user_id", userId);
  const ids = (gm ?? []).map((m) => m.guild_id);
  if (!ids.length) return [];
  const { data } = await supabase.from("guilds").select("id, name, tag, open").in("id", ids);
  return (data as GuildRow[]) ?? [];
}

// DM messages
export async function loadDm(threadId: string): Promise<DmMsg[]> {
  const { data } = await supabase.from("messages").select("id, body, author_id, created_at").eq("dm_thread_id", threadId).order("created_at", { ascending: true }).limit(100);
  return (data as DmMsg[]) ?? [];
}
export async function sendDm(threadId: string, userId: string, body: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("messages").insert({ dm_thread_id: threadId, author_id: userId, body, kind: "text" });
  return { error: error?.message };
}
export function subscribeDm(threadId: string, cb: (m: DmMsg) => void): () => void {
  const ch = supabase.channel(`dm:${threadId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `dm_thread_id=eq.${threadId}` }, (p) => cb(p.new as DmMsg)).subscribe();
  return () => { supabase.removeChannel(ch); };
}
