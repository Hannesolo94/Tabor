// The System — the in-app AI mentor. Tries the Supabase `system-chat` Edge
// Function (Claude) when deployed + keyed; falls back to a local ceremonial
// responder so the feature works in the draft. Swap is transparent: when the
// edge function is live, real Claude replies; until then, the System still speaks.
import { supabase } from "./supabase";
import { VERSES } from "./verses";

export interface SysMsg { role: "user" | "system"; content: string }

function pick<T>(arr: T[], seed: number): T { return arr[Math.abs(seed) % arr.length]; }

function localReply(history: SysMsg[]): string {
  const last = (history.filter((m) => m.role === "user").pop()?.content ?? "").toLowerCase();
  const seed = last.length + history.length;
  const v = pick(VERSES, seed);
  const verse = `\n\n[ SCRIPTURE ]\n"${v.text}"\n— ${v.ref}`;

  if (/(tired|weak|struggle|hard|fail|give up|quit|exhaust|defeat)/.test(last))
    return `[ STATUS ]\nThe weight you feel is the forge, not the grave. Iron does not become a blade in comfort. Rise. Take the next small step. The climb is won in the unseen reps.${verse}`;
  if (/(workout|train|gym|fit|exercise|run|lift)/.test(last))
    return `[ DIRECTIVE ]\nDiscipline the body and it will not betray the spirit. Move today, even briefly. The streak is built one set at a time.${verse}`;
  if (/(pray|bible|scripture|god|jesus|faith|sin|doubt)/.test(last))
    return `[ THE WORD ]\nDraw near and He draws near. Sit with this passage. Carry one line into your day and let it shape your hands.${verse}`;
  if (/(hi|hello|hey|greet|sup|yo)\b/.test(last))
    return `[ SYSTEM ONLINE ]\nWelcome, brother. State your battle and I will counsel you. Body, Word, or Brotherhood.${verse}`;
  return `[ COUNSEL ]\nHeard. Name the next right action and commit to it before the sun sets. Small faithful steps compound into a forged life.${verse}`;
}

export async function askSystem(history: SysMsg[]): Promise<{ reply: string; live: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke("system-chat", { body: { messages: history } });
    if (!error && data?.reply) return { reply: String(data.reply), live: true };
  } catch {
    /* edge function not deployed yet — fall through */
  }
  return { reply: localReply(history), live: false };
}
