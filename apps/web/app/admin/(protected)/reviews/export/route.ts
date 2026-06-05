// CSV export of all reviews. Admin-gated.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { data: profile } = await sb.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (profile?.role !== "admin") return new NextResponse("Forbidden", { status: 403 });

  const { data } = await sb.from("reviews").select("created_at, sku, name, email, rating, title, body, status, consent").order("created_at", { ascending: false });
  const rows = data ?? [];
  const header = "date,sku,name,email,rating,title,body,status,consent";
  const lines = rows.map((r) => [cell(new Date(r.created_at).toISOString().slice(0, 10)), cell(r.sku), cell(r.name), cell(r.email), cell(r.rating), cell(r.title), cell(r.body), cell(r.status), cell(r.consent)].join(","));
  const csv = `${header}\n${lines.join("\n")}\n`;

  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="tabor-reviews.csv"` } });
}
