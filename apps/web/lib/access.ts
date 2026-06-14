// Granular admin access (Discord-style scoped roles). The OWNER and ADMINS have
// everything. A "staff" member (role = 'moderator') only reaches the AREAS the owner
// assigns them, stored in profiles.access (text[]). System + Audit are never assignable
// (owner/admin only). Used by middleware (enforcement), the AdminShell (nav), and the
// staff page (assignment) so all three agree.
export type AreaKey = "store" | "marketing" | "community";

export const AREAS: { key: AreaKey; label: string; desc: string; hrefs: string[] }[] = [
  {
    key: "store",
    label: "Store management",
    desc: "Products, collections, bundles, discounts, suppliers, orders, returns, customers, reviews",
    hrefs: ["/admin/products", "/admin/collections", "/admin/bundles", "/admin/discounts", "/admin/suppliers", "/admin/orders", "/admin/returns", "/admin/customers", "/admin/reviews"],
  },
  {
    key: "marketing",
    label: "Content & marketing",
    desc: "Content Studio, Ad Studio, branding, marketing, pages",
    hrefs: ["/admin/blog", "/admin/ads", "/admin/branding", "/admin/marketing", "/admin/content"],
  },
  {
    key: "community",
    label: "Community & support",
    desc: "Moderation, tickets, giveaways, donations",
    hrefs: ["/admin/moderation", "/admin/tickets", "/admin/giveaways", "/admin/donations"],
  },
];

export const AREA_KEYS: AreaKey[] = AREAS.map((a) => a.key);

// always available to any signed-in staff member
const BASE_HREFS = ["/admin", "/admin/account", "/admin/search"];

/** The set of nav hrefs a staff member with these areas may reach. */
export function allowedHrefs(access: string[] | null | undefined): Set<string> {
  const set = new Set<string>(BASE_HREFS);
  const areas = access ?? [];
  for (const a of AREAS) if (areas.includes(a.key)) a.hrefs.forEach((h) => set.add(h));
  return set;
}

/** Can a limited staff member reach this path? (Owner/admin are allowed before this is called.) */
export function canAccessPath(path: string, access: string[] | null | undefined): boolean {
  if (path === "/admin") return true; // dashboard (exact match only — never a prefix)
  for (const h of allowedHrefs(access)) {
    if (h === "/admin") continue; // already handled; must not prefix-match all of /admin/*
    if (path === h || path.startsWith(h + "/")) return true;
  }
  return false;
}
