// Placeholder product art (until generated designs are uploaded). Mirrors the
// prototype: toned panel + diagonal weave overlay + seal or wordmark + a small
// tagline label. Given a tone/ink/mark from the catalog.
import { TaborSeal } from "@/components/TaborSeal";
import { PIRATA, MONO } from "@/lib/ui";
import type { Product } from "@/lib/catalog";

export function ProductArt({ p, size = 84, square = false }: { p: Product; size?: number; square?: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: square ? "1 / 1" : "4 / 5",
        background: p.tone,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 11px, transparent 11px 22px)",
        }}
      />
      {p.mark === "seal" ? (
        <TaborSeal id={"art-" + p.sku} size={size} />
      ) : (
        <div style={{ fontFamily: PIRATA, fontSize: size * 0.45, color: p.ink, position: "relative" }}>Tabor</div>
      )}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          fontFamily: MONO,
          fontSize: 7.5,
          letterSpacing: "0.14em",
          color: p.ink,
          opacity: 0.6,
        }}
      >
        {p.tagline.toUpperCase()}
      </div>
    </div>
  );
}
