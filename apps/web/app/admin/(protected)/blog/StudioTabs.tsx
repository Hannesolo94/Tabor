// Content Studio tab bar: Posts (the composer + calendar) and Broadcast
// (in-app announcements to every member). Plain links, server-rendered.
import Link from "next/link";
import { GOLD, MONO } from "@/lib/ui";

const TABS: { key: string; label: string; href: string }[] = [
  { key: "posts", label: "Posts", href: "/admin/blog" },
  { key: "broadcast", label: "Broadcast", href: "/admin/blog/broadcast" },
];

export function StudioTabs({ active }: { active: "posts" | "broadcast" }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "16px 0 4px", borderBottom: "1px solid rgba(201,169,97,0.14)", paddingBottom: 0 }}>
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link key={t.key} href={t.href} style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none",
            color: on ? GOLD : "#8A847A", fontWeight: on ? 700 : 400,
            padding: "10px 18px", borderRadius: "10px 10px 0 0",
            background: on ? "rgba(201,169,97,0.08)" : "transparent",
            borderBottom: on ? `2px solid ${GOLD}` : "2px solid transparent",
          }}>{t.label}</Link>
        );
      })}
    </div>
  );
}
