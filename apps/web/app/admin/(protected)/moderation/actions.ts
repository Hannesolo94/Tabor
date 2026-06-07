"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";

export async function deleteReportedMessage(formData: FormData): Promise<void> {
  const reportId = String(formData.get("report_id") ?? "");
  const messageId = String(formData.get("message_id") ?? "");
  const admin = supabaseAdmin();
  if (messageId) await admin.from("messages").delete().eq("id", messageId);
  await admin.from("reports").update({ status: "actioned" }).eq("id", reportId);
  await logAudit("moderation.delete_message", "message", messageId);
  revalidatePath("/admin/moderation");
}

export async function banUser(formData: FormData): Promise<void> {
  const reportId = String(formData.get("report_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  const admin = supabaseAdmin();
  if (userId) await admin.from("profiles").update({ banned: true }).eq("user_id", userId);
  if (reportId) await admin.from("reports").update({ status: "actioned" }).eq("id", reportId);
  await logAudit("moderation.ban", "user", userId);
  revalidatePath("/admin/moderation");
}

export async function unbanUser(formData: FormData): Promise<void> {
  const userId = String(formData.get("user_id") ?? "");
  const admin = supabaseAdmin();
  await admin.from("profiles").update({ banned: false }).eq("user_id", userId);
  await logAudit("moderation.unban", "user", userId);
  revalidatePath("/admin/moderation");
}

export async function dismissReport(formData: FormData): Promise<void> {
  const reportId = String(formData.get("report_id") ?? "");
  const admin = supabaseAdmin();
  await admin.from("reports").update({ status: "dismissed" }).eq("id", reportId);
  revalidatePath("/admin/moderation");
}
