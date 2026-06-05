// CSV export of the email list. Admin-gated (middleware ensures auth; we also
// verify the admin role here since route handlers bypass the layout gate).
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { data: profile } = await sb.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (profile?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });

  const { data } = await sb.from("waitlist").select("email, source, created_at").order("created_at", { ascending: false });
  const rows = data ?? [];

  const header = "email,source,joined";
  const body = rows.map((r) => [csvCell(r.email), csvCell(r.source || "web"), csvCell(new Date(r.created_at).toISOString().slice(0, 10))].join(",")).join("\n");
  const csv = `${header}\n${body}\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tabor-customers.csv"`,
    },
  });
}
