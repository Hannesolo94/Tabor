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
          style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: CINZEL, fontWeight: 600, fontSize: 13, color: "#E8E2D5", background: "linear-gradient(160deg, rgba(40,40,50,0.6), rgba(16,16,22,0.5))", border: `1px solid ${GOLD}33`, borderRadius: 14, boxShadow: "0 8px 18px -10px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "13px 22px", cursor: "pointer" }}
        >
          <span style={{ color: GOLD }}>▸</span>
          {s}
        </button>
      ))}
    </div>
  );
}
