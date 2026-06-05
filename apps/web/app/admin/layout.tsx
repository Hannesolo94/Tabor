// Admin base wrapper (dark canvas, no storefront chrome). Wraps login, setup,
// and the gated dashboard alike. The auth gate + nav shell live in the
// (protected) sub-group so login/setup stay reachable.
export default function AdminBaseLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", background: "#0B0B0E", color: "#E8E2D5" }}>{children}</div>;
}
