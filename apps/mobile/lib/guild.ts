// Guild: realtime chat + roster, against the seeded "Sons of Tabor" guild.
// Anyone who opens the Guild tab auto-joins (guilds are open), so two people on
// the same backend chat in real time.
import { supabase } from "./supabase";

export interface Channel { id: string; name: string }
export interface Msg { id: string; body: string | null; author_id: string | null; created_at: string; authorName?: string }
export interface Member { user_id: string; name: string | null; xp: number | null; streak: number | null; cls: string | null; role: string | null }

export async function ensureGuild(userId: string): Promise<{ guildId: string | null; channels: Channel[] }> {
  const { data: g } = await supabase.from("guilds").select("id").eq("open", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
  const guildId = g?.id ?? null;
  if (!guildId) return { guildId: null, channels: [] };
  await supabase.from("guild_members").upsert({ guild_id: guildId, user_id: userId, role: "member" }, { onConflict: "guild_id,user_id", ignoreDuplicates: true });
  const { data: ch } = await supabase.from("channels").select("id, name").eq("guild_id", guildId);
  return { guildId, channels: (ch as Channel[]) ?? [] };
}

export async function loadChannels(guildId: string): Promise<Channel[]> {
  const { data } = await supabase.from("channels").select("id, name").eq("guild_id", guildId);
  return (data as Channel[]) ?? [];
}

export interface ReactionInfo { counts: Record<string, number>; mine: string[] }
export async function loadReactions(messageIds: string[], userId: string): Promise<Record<string, ReactionInfo>> {
  if (!messageIds.length) return {};
  const { data } = await supabase.from("reactions").select("message_id, user_id, emoji").in("message_id", messageIds);
  const map: Record<string, ReactionInfo> = {};
  for (const r of data ?? []) {
    const info = (map[r.message_id] ??= { counts: {}, mine: [] });
    info.counts[r.emoji] = (info.counts[r.emoji] ?? 0) + 1;
    if (r.user_id === userId) info.mine.push(r.emoji);
  }
  return map;
}
export async function toggleReaction(messageId: string, userId: string, emoji: string, on: boolean): Promise<void> {
  if (on) await supabase.from("reactions").upsert({ message_id: messageId, user_id: userId, emoji }, { onConflict: "message_id,user_id,emoji", ignoreDuplicates: true });
  else await supabase.from("reactions").delete().eq("message_id", messageId).eq("user_id", userId).eq("emoji", emoji);
}

export async function loadMessages(channelId: string): Promise<Msg[]> {
  const { data } = await supabase.from("messages").select("id, body, author_id, created_at").eq("channel_id", channelId).eq("hidden", false).order("created_at", { ascending: true }).limit(100);
  return (data as Msg[]) ?? [];
}

export async function sendMessage(channelId: string, guildId: string, userId: string, body: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("messages").insert({ channel_id: channelId, guild_id: guildId, author_id: userId, body, kind: "text" });
  if (!error) supabase.rpc("notify_message", { p_channel: channelId, p_dm: null, p_body: body }).then(() => {});
  return { error: error?.message };
}

export async function loadRoster(guildId: string): Promise<Member[]> {
  const { data: gm } = await supabase.from("guild_members").select("user_id, role").eq("guild_id", guildId);
  const ids = (gm ?? []).map((m) => m.user_id);
  if (!ids.length) return [];
  const roleBy = new Map((gm ?? []).map((m) => [m.user_id, m.role]));
  const { data: profs } = await supabase.from("profiles").select("user_id, name, xp, streak, cls").in("user_id", ids);
  return ((profs as Member[]) ?? []).map((p) => ({ ...p, role: roleBy.get(p.user_id) ?? "member" })).sort((a, b) => (Number(b.xp) || 0) - (Number(a.xp) || 0));
}

/** Subscribe to new messages on a channel. Returns an unsubscribe fn. */
export function subscribeMessages(channelId: string, onInsert: (m: Msg) => void): () => void {
  const ch = supabase
    .channel(`room:${channelId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${channelId}` }, (payload) => {
      const m = payload.new as Msg & { hidden?: boolean };
      if (!m.hidden) onInsert(m); // auto-modded messages never reach members
    })
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}
