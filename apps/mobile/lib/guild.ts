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
  // SECURITY DEFINER RPC — reliable join (the client upsert hit an RLS edge)
  await supabase.rpc("join_guild", { p_guild_id: guildId });
  const { data: ch } = await supabase.from("channels").select("id, name").eq("guild_id", guildId);
  return { guildId, channels: (ch as Channel[]) ?? [] };
}

export interface ExploreGuild { id: string; name: string; tag: string | null; members: number; joined: boolean }
export async function exploreGuilds(): Promise<ExploreGuild[]> {
  const { data } = await supabase.rpc("explore_guilds");
  return (data as ExploreGuild[]) ?? [];
}
export async function joinGuild(guildId: string): Promise<void> {
  await supabase.rpc("join_guild", { p_guild_id: guildId });
}

export async function loadChannels(guildId: string): Promise<Channel[]> {
  const { data } = await supabase.from("channels").select("id, name").eq("guild_id", guildId);
  return (data as Channel[]) ?? [];
}

/** The global Announcements / Community channels (everyone is a member of their guild). */
export async function getGlobalChannel(system: "community" | "announcements"): Promise<{ id: string; guild_id: string } | null> {
  const { data } = await supabase.from("channels").select("id, guild_id").eq("system", system).limit(1).maybeSingle();
  return (data as { id: string; guild_id: string }) ?? null;
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

export async function sendMessage(channelId: string, guildId: string, userId: string, body: string): Promise<{ error?: string; hidden?: boolean }> {
  // push is fired by a DB trigger (skips auto-modded/hidden messages). We read
  // back `hidden` so the UI can tell the sender if the guardian removed it.
  const { data, error } = await supabase.from("messages").insert({ channel_id: channelId, guild_id: guildId, author_id: userId, body, kind: "text" }).select("hidden").single();
  return { error: error?.message, hidden: data?.hidden ?? false };
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
