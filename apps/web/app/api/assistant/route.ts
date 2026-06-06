// Admin-only AI assistant endpoint. Verifies the admin role, then runs the
// agentic assistant over the store data.
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { runAssistant, type ChatMessage } from "@/lib/assistant";

export async function POST(req: Request) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: profile } = await sb.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const messages = (body.messages ?? []).filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
  if (!messages.length) return NextResponse.json({ error: "no messages" }, { status: 400 });

  const result = await runAssistant(messages);
  return NextResponse.json(result);
}
