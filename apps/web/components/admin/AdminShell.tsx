// Admin shell: sidebar nav + content area. Server component; nav links are plain
// anchors. Items marked "soon" are coming in the next admin phases.
import Link from "next/link";
import { TaborSeal } from "@/components/TaborSeal";
import { LogoutButton } from "./LogoutButton";
import { GOLD, MONO, PIRATA } from "@/lib/ui";

const NAV: { label: string; href: string; soon?: boolean }[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Products", href: "/admin/products" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Content", href: "/admin/content" },
  { label: "Discounts", href: "/admin/discounts" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Marketing", href: "/admin/marketing" },
  { label: "Suppliers", href: "/admin/suppliers" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminShell({ email, name, children }: { email?: string; name?: string | null; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", minHeight: "100vh" }}>
      {/* sidebar */}
      <aside style={{ borderRight: "1px solid rgba(201,169,97,0.16)", background: "#0C0C10", padding: "22px 16px", display: "flex", flexDirection: "column" }}>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 26 }}>
          <TaborSeal id="admin-nav" size={26} />
          <span style={{ fontFamily: PIRATA, fontSize: 22, color: GOLD }}>Tabor</span>
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.soon ? "#" : n.href} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: n.soon ? "#8A847A" : "#C3BDB1", textDecoration: "none", padding: "10px 10px", textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: n.soon ? "none" : "auto" }}>
              {n.label}
              {n.soon && <span style={{ fontSize: 7.5, color: GOLD, letterSpacing: "0.1em", border: `1px solid ${GOLD}44`, padding: "2px 4px" }}>SOON</span>}
            </Link>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid rgba(201,169,97,0.14)", paddingTop: 14, marginTop: 14 }}>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.06em", marginBottom: 4 }}>{(name || "Admin").toUpperCase()}</div>
          <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", marginBottom: 10, wordBreak: "break-all" }}>{email}</div>
          <LogoutButton />
          <Link href="/" style={{ display: "block", textAlign: "center", marginTop: 8, fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none", textTransform: "uppercase" }}>View Site ↗</Link>
        </div>
      </aside>

      {/* content */}
      <div style={{ padding: "30px 32px", maxWidth: 1100 }}>{children}</div>
    </div>
  );
}
