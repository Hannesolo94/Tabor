// Admin shell: sidebar nav + content area. Server component; nav links are plain
// anchors. Items marked "soon" are coming in the next admin phases.
import Link from "next/link";
import { TaborSeal } from "@/components/TaborSeal";
import { LogoutButton } from "./LogoutButton";
import { DeployIndicator } from "./DeployIndicator";
import { AutoRefresh } from "./AutoRefresh";
import { AdminNav } from "./AdminNav";
import { GOLD, MONO, PIRATA } from "@/lib/ui";

// Grouped nav (IA audit). Routes are unchanged; only labels/grouping differ.
const NAV_GROUPS: { section: string; items: { label: string; href: string }[] }[] = [
  { section: "Overview", items: [
    { label: "Dashboard", href: "/admin" },
    { label: "Assistant", href: "/admin/assistant" },
  ] },
  { section: "Products", items: [
    { label: "Products", href: "/admin/products" },
    { label: "Collections", href: "/admin/collections" },
    { label: "Bundles", href: "/admin/bundles" },
    { label: "Discounts", href: "/admin/discounts" },
    { label: "Suppliers", href: "/admin/suppliers" },
  ] },
  { section: "Sales", items: [
    { label: "Orders", href: "/admin/orders" },
    { label: "Returns", href: "/admin/returns" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Reviews", href: "/admin/reviews" },
  ] },
  { section: "Design & Marketing", items: [
    { label: "Branding", href: "/admin/branding" },
    { label: "Marketing", href: "/admin/marketing" },
    { label: "Pages", href: "/admin/content" },
    { label: "Content Studio", href: "/admin/blog" },
    { label: "Ad Studio", href: "/admin/ads" },
  ] },
  { section: "Community", items: [
    { label: "Moderation", href: "/admin/moderation" },
    { label: "Tickets", href: "/admin/tickets" },
    { label: "Giveaways", href: "/admin/giveaways" },
    { label: "Donations", href: "/admin/donations" },
  ] },
  { section: "System", items: [
    { label: "Admins", href: "/admin/admins" },
    { label: "Settings", href: "/admin/settings" },
  ] },
  { section: "Audit", items: [
    { label: "Audit Log", href: "/admin/audit" },
    { label: "Audit Report", href: "/admin/audit-report" },
  ] },
];

// Moderators only see the dashboard + safety tools. Broadcast is admin-only (it
// messages every member), so it is not in this set.
const MOD_HREFS = new Set(["/admin", "/admin/moderation", "/admin/tickets", "/admin/giveaways"]);

export function AdminShell({ email, name, role, children }: { email?: string; name?: string | null; role?: string; children: React.ReactNode }) {
  const groups = role === "moderator"
    ? NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => MOD_HREFS.has(i.href)) })).filter((g) => g.items.length)
    : NAV_GROUPS;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "248px 1fr", minHeight: "100vh" }}>
      {/* sidebar */}
      <aside style={{ borderRight: "1px solid rgba(201,169,97,0.16)", background: "linear-gradient(160deg, rgba(20,20,26,0.92), rgba(10,10,14,0.92))", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", boxShadow: "inset -1px 0 0 rgba(255,255,255,0.03)", padding: "22px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 26 }}>
          <TaborSeal id="admin-nav" size={26} />
          <span style={{ fontFamily: PIRATA, fontSize: 22, color: GOLD }}>Tabor</span>
        </Link>
        <form action="/admin/search" method="get" style={{ marginBottom: 16 }}>
          <input name="q" placeholder="Search…" aria-label="Search admin" style={{ width: "100%", fontFamily: MONO, fontSize: 11, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "8px 10px" }} />
        </form>
        <AdminNav groups={groups} />
        <div style={{ borderTop: "1px solid rgba(201,169,97,0.14)", paddingTop: 14, marginTop: 14 }}>
          <div style={{ marginBottom: 12 }}><DeployIndicator /></div>
          <AutoRefresh seconds={60} />
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.06em", marginBottom: 4 }}>{(name || "Admin").toUpperCase()}</div>
          <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", marginBottom: 8, wordBreak: "break-all" }}>{email}</div>
          <Link href="/admin/account" style={{ display: "block", fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase", marginBottom: 8 }}>Account &amp; password</Link>
          <LogoutButton />
          <Link href="/" style={{ display: "block", textAlign: "center", marginTop: 8, fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none", textTransform: "uppercase" }}>View Site ↗</Link>
        </div>
      </aside>

      {/* content — centered column (Shopify-style), with margin on both sides */}
      <div style={{ padding: "36px 32px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 1180, width: "100%" }}>{children}</div>
      </div>
    </div>
  );
}
