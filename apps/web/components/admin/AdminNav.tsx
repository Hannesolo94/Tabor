"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Group = { section: string; items: { label: string; href: string }[] };

export function AdminNav({ groups }: { groups: Group[] }) {
  const path = usePathname() || "";
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  const groupActive = (g: Group) => g.items.some((i) => active(i.href));
  // expanded by default = the group that holds the current route
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(groups.map((g) => [g.section, groupActive(g)])));
  const toggle = (s: string) => setOpen((o) => ({ ...o, [s]: !o[s] }));

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
      {groups.map((g) => {
        const isOpen = open[g.section] ?? groupActive(g);
        return (
          <div key={g.section} style={{ marginBottom: 4 }}>
            <button type="button" onClick={() => toggle(g.section)} className="admin-nav-group" aria-expanded={isOpen}>
              <span>{g.section}</span>
              <span style={{ display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s ease", opacity: 0.55, fontSize: 9 }}>▸</span>
            </button>
            {isOpen && (
              <div style={{ marginTop: 2 }}>
                {g.items.map((n) => (
                  <Link key={n.href} href={n.href} className={`admin-nav-link${active(n.href) ? " active" : ""}`}>{n.label}</Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
