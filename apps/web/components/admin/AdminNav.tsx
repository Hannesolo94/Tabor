"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Group = { section: string; items: { label: string; href: string }[] };

export function AdminNav({ groups }: { groups: Group[] }) {
  const path = usePathname() || "";
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
      {groups.map((g) => (
        <div key={g.section} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 9, color: "#c9a961", letterSpacing: "0.18em", textTransform: "uppercase", padding: "4px 11px 5px", opacity: 0.7 }}>{g.section}</div>
          {g.items.map((n) => (
            <Link key={n.href} href={n.href} className={`admin-nav-link${active(n.href) ? " active" : ""}`}>{n.label}</Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
