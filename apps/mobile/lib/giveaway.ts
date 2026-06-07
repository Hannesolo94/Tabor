import { supabase } from "./supabase";

export interface Nominee { user_id: string; name: string; cls: string | null; votes: number }
export interface Giveaway {
  id: string; month: string; prize: string; product_sku: string | null; closes_at: string | null;
  my_vote: string | null; am_nominee: boolean; nominees: Nominee[];
}

export async function getActiveGiveaway(): Promise<Giveaway | null> {
  const { data } = await supabase.rpc("active_giveaway");
  return (data as Giveaway) ?? null;
}
export async function voteGiveaway(gid: string, nomineeId: string) {
  return supabase.rpc("cast_giveaway_vote", { p_gid: gid, p_nominee: nomineeId });
}
export async function standForGiveaway(gid: string) {
  return supabase.rpc("nominate_self", { p_gid: gid });
}
