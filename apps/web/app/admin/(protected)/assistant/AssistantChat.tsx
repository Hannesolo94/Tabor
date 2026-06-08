"use client";

// Admin AI assistant chat. Talks to /api/assistant which runs the agentic
// tool-use loop over the store data.
import { useRef, useState } from "react";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

interface Msg { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "How are sales this month?",
  "What are my best-selling products?",
  "Which products are low on stock?",
  "Suggest a marketing push based on my traffic.",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "(no response)" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong reaching the assistant." }]);
    }
    setBusy(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", minHeight: 360, maxHeight: 520, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div>
            <p style={{ fontFamily: BODY, fontSize: 14, color: "#9A948A", marginTop: 0 }}>Ask about your store — sales, products, traffic, what to do next.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} style={{ fontFamily: MONO, fontSize: 10.5, color: GOLD, background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}44`, borderRadius: 10, padding: "8px 12px", cursor: "pointer", textAlign: "left" }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: m.role === "user" ? GOLD : "#8A847A", letterSpacing: "0.14em", marginBottom: 4, textAlign: m.role === "user" ? "right" : "left" }}>{m.role === "user" ? "YOU" : "ASSISTANT"}</div>
            <div style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: "#E8E2D5", background: m.role === "user" ? "linear-gradient(160deg, rgba(201,169,97,0.22), rgba(201,169,97,0.1))" : "linear-gradient(160deg, rgba(40,40,50,0.6), rgba(18,18,24,0.5))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, ...(m.role === "user" ? { borderBottomRightRadius: 5 } : { borderBottomLeftRadius: 5 }), padding: "12px 14px", whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {busy && <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.1em" }}>THINKING…</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the assistant…" aria-label="Ask the assistant" style={{ flex: 1, fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}44`, borderRadius: 12, padding: "12px 14px" }} />
        <button type="submit" disabled={busy} style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "12px 22px", cursor: "pointer" }}>Send</button>
      </form>
    </div>
  );
}
