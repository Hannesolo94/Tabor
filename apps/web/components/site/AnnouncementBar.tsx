"use client";

// Rotating top bar. Cycles through enabled announcements; each cycle carries its
// own colors, optional background image, and font. One announcement shown per
// cycle, auto-advancing.
import { useEffect, useState } from "react";
import Link from "next/link";
import { FONT_VAR, type Announcement } from "@/lib/announcements-db";

export function AnnouncementBar({ items }: { items: Announcement[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const a = items[Math.min(i, items.length - 1)]!;

  const inner = (
    <div
      style={{
        position: "relative",
        textAlign: "center",
        padding: "8px 16px",
        fontFamily: FONT_VAR[a.font] ?? FONT_VAR.mono,
        fontSize: 11,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: a.text_color,
        background: a.bg_color,
        overflow: "hidden",
      }}
    >
      {a.bg_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.bg_image_url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
      )}
      <span style={{ position: "relative" }}>{a.text}</span>
    </div>
  );

  return a.link ? (
    <Link href={a.link} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>
  ) : (
    inner
  );
}
