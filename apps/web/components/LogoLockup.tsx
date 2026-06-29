// Presentational brand lockup, rendered from logo DATA (no fetching, no server imports)
// so it works in both server and client components. Prefers the uploaded full logo,
// then the uploaded icon + "Tabor", then the built-in SVG seal + "Tabor".
import { TaborSeal } from "@/components/TaborSeal";
import type { BrandLogos } from "@/lib/brand";
import { GOLD, PIRATA } from "@/lib/ui";

export function LogoLockup({ logo, iconSize = 52, wordmarkHeight = 60, textSize = 30, idSuffix = "lock" }: { logo?: BrandLogos; iconSize?: number; wordmarkHeight?: number; textSize?: number; idSuffix?: string }) {
  if (logo?.wordmark) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo.wordmark} alt="Tabor" style={{ height: wordmarkHeight, width: "auto", maxWidth: "100%", objectFit: "contain", display: "block", margin: "0 auto" }} />;
  }
  return (
    <div style={{ display: "grid", placeItems: "center", gap: 6 }}>
      {logo?.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo.icon} alt="" style={{ width: iconSize, height: iconSize, objectFit: "contain", display: "block" }} />
      ) : (
        <TaborSeal id={`logolock-${idSuffix}`} size={iconSize} />
      )}
      <span style={{ fontFamily: PIRATA, fontSize: textSize, color: GOLD, lineHeight: 1 }}>Tabor</span>
    </div>
  );
}
