"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function setReportStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["open", "triaged", "resolved"].includes(status)) return;
  const sb = await supabaseServer();
  await sb.from("bug_reports").update({ status }).eq("id", id);
  await logAudit("ticket.status", "bug_report", id, { status });
  revalidatePath("/admin/tickets");
}
