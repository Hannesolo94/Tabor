"use client";

import { useActionState } from "react";
import { syncPrintful, type SyncState } from "./actions";
import { GOLD, MONO } from "@/lib/ui";

const initial: SyncState = {};

export function SyncButton() {
  const [state, action, pending] = useActionState(syncPrintful, initial);
  return (
    <form action={action}>
      <button type="submit" disabled={pending} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "12px 22px", cursor: "pointer" }}>
        {pending ? "Syncing..." : "Sync from Printful"}
      </button>
      {state.ok && (
        <p style={{ fontFamily: MONO, fontSize: 11, color: "#7BBF7B", marginTop: 12, letterSpacing: "0.06em" }}>
          [ SYNCED ] {state.total} on Printful · {state.imported} imported · {state.updated} updated.{" "}
          {state.imported ? "New items are DRAFT under The Sentinel. Assign personas and publish in Products." : ""}
        </p>
      )}
      {state.error && <p style={{ fontFamily: MONO, fontSize: 11, color: "#C03A3A", marginTop: 12 }}>{state.error}</p>}
    </form>
  );
}
