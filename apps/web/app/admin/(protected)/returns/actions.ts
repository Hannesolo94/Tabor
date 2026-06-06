"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const STATUSES = new Set(["requested", "approved", "rejected", "received", "refunded", "closed"]);

export async function updateReturn(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNote = String(formData.get("admin_note") ?? "");
  if (!id || !STATUSES.has(status)) return;
  const sb = await supabaseServer();
  await sb.from("return_requests").update({ status, admin_note: adminNote || null, updated_at: new Date().toISOString() }).eq("id", id);
  await logAudit("return.update", "return", id, { status });
  revalidatePath("/admin/returns");
}
