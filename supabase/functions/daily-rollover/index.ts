// daily-rollover — scheduled (cron). For each player, reconcile missed days
// (spend freezes or break the streak), write day_history, and reset today's
// quests. Mirrors reconcile() in @tabor/shared — keep the two in lockstep.
// Protect with a cron secret since verify_jwt is off for this function.

import { json } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

function dstr(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(s: string, n: number) {
  const d = new Date(s + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return dstr(d);
}

Deno.serve(async (req) => {
  // Simple shared-secret guard for the scheduler.
  const secret = Deno.env.get("ROLLOVER_SECRET");
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return json({ error: "unauthorized" }, 401);
  }

  const supabase = serviceClient();
  const today = dstr(new Date());

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("user_id, streak, freezes, last_active")
    .neq("last_active", today);
  if (error) return json({ error: error.message }, 500);

  let processed = 0;
  for (const p of profiles ?? []) {
    let { streak, freezes } = p as { streak: number; freezes: number };
    const lastActive = (p as { last_active: string | null }).last_active;
    const historyWrites: Array<{ user_id: string; day: string; status: string }> = [];

    if (lastActive) {
      const yesterday = addDays(today, -1);
      let cur = addDays(lastActive, 1);
      let guard = 0;
      while (cur <= yesterday && guard < 400) {
        // Days already sealed are skipped; we only fill the gaps.
        const { data: existing } = await supabase
          .from("day_history")
          .select("status")
          .eq("user_id", (p as { user_id: string }).user_id)
          .eq("day", cur)
          .maybeSingle();
        if (existing?.status !== "sealed") {
          if (freezes > 0) {
            freezes -= 1;
            historyWrites.push({ user_id: (p as { user_id: string }).user_id, day: cur, status: "frozen" });
          } else {
            streak = 0;
            historyWrites.push({ user_id: (p as { user_id: string }).user_id, day: cur, status: "missed" });
          }
        }
        cur = addDays(cur, 1);
        guard++;
      }
    }

    if (historyWrites.length) {
      await supabase.from("day_history").upsert(historyWrites, { onConflict: "user_id,day" });
    }
    await supabase
      .from("profiles")
      .update({ streak, freezes, last_active: today })
      .eq("user_id", (p as { user_id: string }).user_id);

    // Reset today's quests (issue fresh instances). MVP reuses scout/iron/line.
    await supabase
      .from("quests")
      .update({ done: false, progress: 0 })
      .eq("user_id", (p as { user_id: string }).user_id)
      .eq("day", today);

    processed++;
  }

  return json({ processed, today });
});
