// Send Expo push notifications to device tokens (https://exp.host push API).
// No secret required; tokens come from the push_tokens table.
interface PushMsg { to: string; title: string; body: string; data?: Record<string, unknown> }

export async function sendExpoPush(tokens: string[], title: string, body: string, data?: Record<string, unknown>): Promise<number> {
  const valid = tokens.filter((t) => t && t.startsWith("ExponentPushToken"));
  if (!valid.length) return 0;
  const messages: PushMsg[] = valid.map((to) => ({ to, title, body, data }));
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chunk),
      });
      if (res.ok) sent += chunk.length;
    } catch { /* best effort */ }
  }
  return sent;
}
