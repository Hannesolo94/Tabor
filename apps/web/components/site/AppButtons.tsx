"use client";

// App Store / Google Play buttons that track clicks (for the dashboard). The app
// is not published yet, so they record intent rather than linking out.
import { track } from "@/lib/track";
import { GOLD, CINZEL } from "@/lib/ui";

export function AppButtons() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {["App Store", "Google Play"].map((s) => (
        <button
          key={s}
          onClick={() => track("app_click", { meta: { store: s } })}
          style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: CINZEL, fontWeight: 600, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}55`, padding: "12px 20px", cursor: "pointer" }}
        >
          <span style={{ color: GOLD }}>▸</span>
          {s}
        </button>
      ))}
    </div>
  );
}
