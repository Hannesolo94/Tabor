// Latest production deploy state from the Vercel API (token stays server-side).
// Powers the LED indicator in the admin sidebar. Requires VERCEL_TOKEN (+ optional
// VERCEL_PROJECT_ID) in the environment, including on Vercel itself.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const PROJECT = process.env.VERCEL_PROJECT_ID || "prj_IW3tEicRbU7B4npqf9t45CCHPdBf";

export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ state: "unknown" }, { status: 401 });

  const token = process.env.VERCEL_TOKEN;
  if (!token) return NextResponse.json({ state: "unconfigured" });
  try {
    const team = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : "";
    const r = await fetch(`https://api.vercel.com/v6/deployments?projectId=${PROJECT}&limit=1&target=production${team}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const j = await r.json();
    const d = j.deployments?.[0];
    return NextResponse.json({ state: d?.state ?? d?.readyState ?? "unknown", createdAt: d?.createdAt ?? null });
  } catch {
    return NextResponse.json({ state: "unknown" });
  }
}
