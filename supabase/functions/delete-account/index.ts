// delete-account — honors the privacy promise: a real, total wipe.
// Deletes every row the user owns across every table, then the auth user itself.
// Most child tables cascade from auth.users, but we delete explicitly first so
// the wipe is auditable and not reliant solely on FK cascade config.

import { corsHeaders, json } from "../_shared/cors.ts";
import { serviceClient, userFromRequest } from "../_shared/supabase.ts";

// Tables keyed by the user. (Guild/message authorship is set null via FK so the
// account can be erased without breaking other members' chat history.)
const USER_TABLES = [
  "day_history",
  "quests",
  "notes",
  "bookmarks",
  "workouts",
  "personal_records",
  "tabata_presets",
  "achievements",
  "seeker_progress",
  "guild_members",
  "dm_participants",
  "reactions",
  "giveaway_nominees",
  "notifications",
  "profiles",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await userFromRequest(req);
  if (!user) return json({ error: "unauthorized" }, 401);

  const supabase = serviceClient();

  for (const table of USER_TABLES) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) return json({ error: `failed wiping ${table}: ${error.message}` }, 500);
  }
  // votes use voter_id, orders use user_id-nullable (kept for accounting, anonymized)
  await supabase.from("giveaway_votes").delete().eq("voter_id", user.id);
  await supabase.from("orders").update({ user_id: null }).eq("user_id", user.id);

  // Finally remove the auth user. Cascades clean up anything missed.
  const { error: authErr } = await supabase.auth.admin.deleteUser(user.id);
  if (authErr) return json({ error: authErr.message }, 500);

  return json({ deleted: true });
});
