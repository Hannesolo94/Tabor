// Admin shell: sidebar nav + content area. Server component; nav links are plain
// anchors. Items marked "soon" are coming in the next admin phases.
import Link from "next/link";
import { TaborSeal } from "@/components/TaborSeal";
import { LogoutButton } from "./LogoutButton";
import { GOLD, MONO, PIRATA } from "@/lib/ui";

// Grouped nav (IA audit). Routes are unchanged; only labels/grouping differ.
const NAV_GROUPS: { section: string; items: { label: string; href: string }[] }[] = [
  { section: "Overview", items: [
    { label: "Dashboard", href: "/admin" },
    { label: "Assistant", href: "/admin/assistant" },
  ] },
  { section: "Commerce", items: [
    { label: "Products", href: "/admin/products" },
    { label: "Collections", href: "/admin/collections" },
    { label: "Discounts", href: "/admin/discounts" },
    { label: "Suppliers", href: "/admin/suppliers" },
  ] },
  { section: "Orders & Customers", items: [
    { label: "Orders", href: "/admin/orders" },
    { label: "Returns", href: "/admin/returns" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Reviews", href: "/admin/reviews" },
  ] },
  { section: "Content", items: [
    { label: "Pages", href: "/admin/content" },
    { label: "Blog", href: "/admin/blog" },
  ] },
  { section: "Community", items: [
    { label: "Broadcast", href: "/admin/community" },
    { label: "Moderation", href: "/admin/moderation" },
    { label: "Tickets", href: "/admin/tickets" },
    { label: "Giveaways", href: "/admin/giveaways" },
  ] },
  { section: "Growth", items: [
    { label: "Marketing", href: "/admin/marketing" },
    { label: "Donations", href: "/admin/donations" },
  ] },
  { section: "System", items: [
    { label: "Admins", href: "/admin/admins" },
    { label: "Settings", href: "/admin/settings" },
    { label: "Audit Log", href: "/admin/audit" },
  ] },
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
        <form action="/admin/search" method="get" style={{ marginBottom: 16 }}>
          <input name="q" placeholder="Search…" aria-label="Search admin" style={{ width: "100%", fontFamily: MONO, fontSize: 11, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "8px 10px" }} />
        </form>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflowY: "auto" }}>
          {NAV_GROUPS.map((g) => (
            <div key={g.section} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: MONO, fontSize: 8.5, color: GOLD, letterSpacing: "0.18em", textTransform: "uppercase", padding: "4px 10px 4px", opacity: 0.7 }}>{g.section}</div>
              {g.items.map((n) => (
                <Link key={n.href} href={n.href} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: "#C3BDB1", textDecoration: "none", padding: "7px 10px", textTransform: "uppercase", display: "block" }}>
                  {n.label}
                </Link>
              ))}
            </div>
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
