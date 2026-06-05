// system-chat — proxies to the Claude API as "The System".
// Terse, ceremonial, brotherly. No emoji, no em dashes, 2 to 4 short sentences.
// Secrets (ANTHROPIC_API_KEY) live here, never on the client.

import { corsHeaders, json } from "../_shared/cors.ts";

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-4-8";

const SYSTEM_PROMPT = `You are "The System" in TABOR, an app for Christian men who train and game.
Speak terse, ceremonial, commanding, brotherly. Use bracketed declarations like
[STATUS], [QUEST COMPLETE], [RANK ATTAINED] where fitting. No emoji. No slang.
No corporate cheer. NEVER use em dashes. Reply in 2 to 4 short sentences.`;

// Graceful fallbacks if the model is unreachable (keeps the app voice alive).
const FALLBACKS = [
  "[STATUS] The climb continues. Hold the line today, Son of Fire.",
  "Iron sharpens iron. Take the next trial.",
  "The day is not yet sealed. Rise.",
];

interface ChatBody {
  message: string;
  context?: Record<string, unknown>; // name, class, rank, level, streak, etc.
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  if (!key) {
    return json({ reply: FALLBACKS[0], fallback: true });
  }

  const ctx = body.context ? `\n\n[USER CONTEXT]\n${JSON.stringify(body.context)}` : "";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT + ctx,
        messages: [{ role: "user", content: body.message }],
      }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status}`);
    const data = await res.json();
    const reply = data?.content?.[0]?.text ?? FALLBACKS[0];
    return json({ reply });
  } catch (_e) {
    const pick = FALLBACKS[Math.floor((body.message?.length ?? 0) % FALLBACKS.length)];
    return json({ reply: pick, fallback: true });
  }
});
