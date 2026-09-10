"use client";

// Two-step refund. Refunding is irreversible and moves real money, so a single
// click is the wrong affordance: the first press only arms it, and the armed
// state states the exact amount and currency so a misread order cannot be
// refunded by muscle memory. Disarms itself after 8 seconds.
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { refundOrder } from "./actions";
import { GOLD, MONO } from "@/lib/ui";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{
      fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
      padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(192,58,58,0.55)",
      background: pending ? "rgba(192,58,58,0.25)" : "linear-gradient(180deg, #d9534f, #b32d2a)",
      color: "#fff", cursor: pending ? "wait" : "pointer", opacity: pending ? 0.7 : 1,
    }}>{pending ? "Refunding…" : label}</button>
  );
}

export function RefundButton({ orderId, amount, currency, symbol, disabledReason }: {
  orderId: string;
  amount: number;
  currency: string;
  symbol: string;
  disabledReason?: string | null;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!armed) return;
    timer.current = setTimeout(() => setArmed(false), 8000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [armed]);

  if (disabledReason) {
    return (
      <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#7A746A", letterSpacing: "0.06em", marginTop: 12 }}>
        REFUND UNAVAILABLE · {disabledReason.toUpperCase()}
      </div>
    );
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        style={{
          fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "9px 14px", borderRadius: 10, border: `1px solid ${GOLD}33`,
          background: "transparent", color: "#9A948A", cursor: "pointer", marginTop: 12,
        }}
      >
        Refund order
      </button>
    );
  }

  return (
    <form action={refundOrder} style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input type="hidden" name="id" value={orderId} />
      <span style={{ fontFamily: MONO, fontSize: 10, color: "#F87171", letterSpacing: "0.06em" }}>
        REFUND {symbol}{amount.toFixed(2)} {currency}?
      </span>
      <Submit label="Yes, refund" />
      <button type="button" onClick={() => setArmed(false)} style={{
        fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "9px 12px", borderRadius: 10, border: `1px solid ${GOLD}33`,
        background: "transparent", color: "#9A948A", cursor: "pointer",
      }}>Cancel</button>
    </form>
  );
}
