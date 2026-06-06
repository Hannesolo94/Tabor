// Audit logging helper. Call from admin server actions to record who did what.
// Best-effort: never throws into the action path.
import { supabaseServer } from "@/lib/supabase/server";

export async function logAudit(action: string, entity: string, entityId?: string, detail: Record<string, unknown> = {}) {
  try {
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    await sb.from("audit_log").insert({ actor: user?.email ?? "system", action, entity, entity_id: entityId ?? null, detail });
  } catch {
    /* logging must not break the action */
  }
}
