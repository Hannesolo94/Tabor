"use client";

// Storefront product gallery: a main viewer (image or inline video) with
// thumbnail strip. Falls back to the generated seal art when there's no media.
import { useState } from "react";
import { ProductArt } from "./ProductArt";
import type { Media } from "@/lib/media-db";
import type { Product } from "@/lib/catalog";
import { GOLD } from "@/lib/ui";

export function ProductGallery({ product, media }: { product: Product; media: Media[] }) {
  const [active, setActive] = useState(0);

  if (media.length === 0) {
    // fall back to uploaded single image (ProductArt handles imageUrl) or seal art
    return (
      <div style={{ border: "1px solid rgba(201,169,97,0.2)" }}>
        <ProductArt p={product} size={150} square />
      </div>
    );
  }

  const current = media[Math.min(active, media.length - 1)]!;

  return (
    <div>
      <div style={{ border: "1px solid rgba(201,169,97,0.2)", background: product.tone, aspectRatio: "1 / 1", overflow: "hidden", display: "grid", placeItems: "center" }}>
        {current.type === "video" ? (
          <video src={current.url} controls autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt ?? product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>

      {media.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              style={{ width: 60, height: 60, padding: 0, border: `1px solid ${i === active ? GOLD : "rgba(201,169,97,0.25)"}`, background: "#15151A", cursor: "pointer", overflow: "hidden", position: "relative" }}
            >
              {m.type === "video" ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <video src={m.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: GOLD, fontSize: 16 }}>▶</span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
