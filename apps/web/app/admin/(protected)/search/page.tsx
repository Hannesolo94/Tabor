// Global admin search — one box across products, customers, and reviews.
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.18em", marginBottom: 10 }}>{title} ({count})</div>
      {count === 0 ? <p style={{ fontFamily: BODY, fontSize: 13, color: "#8A847A" }}>No matches.</p> : <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "#0E0E12" }}>{children}</div>}
    </div>
  );
}
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", textDecoration: "none" };

export default async function AdminSearch({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const sb = await supabaseServer();

  const [products, customers, profiles, reviews] = q
    ? await Promise.all([
        sb.from("products").select("sku, name, base_price, status").or(`name.ilike.%${q}%,sku.ilike.%${q}%`).limit(15),
        sb.from("waitlist").select("email, source").ilike("email", `%${q}%`).limit(15),
        sb.from("profiles").select("email, name").or(`email.ilike.%${q}%,name.ilike.%${q}%`).limit(15),
        sb.from("reviews").select("id, name, title, sku, status").or(`name.ilike.%${q}%,body.ilike.%${q}%,title.ilike.%${q}%`).limit(15),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  // merge customer emails (waitlist + profiles), unique
  const emails = new Map<string, string>();
  for (const c of customers.data ?? []) emails.set(c.email, c.source || "web");
  for (const p of profiles.data ?? []) if (p.email) emails.set(p.email, "account");
  const customerList = [...emails.entries()];

  const prod = products.data ?? [];
  const revs = reviews.data ?? [];

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ SEARCH ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 16px" }}>Search</h1>
      <form action="/admin/search" method="get" style={{ display: "flex", gap: 8, marginBottom: 28, maxWidth: 520 }}>
        <input name="q" defaultValue={q} autoFocus placeholder="Products, customers, reviews..." style={{ flex: 1, fontFamily: BODY, fontSize: 14, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}44`, padding: "12px 14px" }} />
        <button type="submit" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "12px 20px", cursor: "pointer" }}>Search</button>
      </form>

      {!q ? (
        <p style={{ fontFamily: BODY, fontSize: 14, color: "#8A847A" }}>Type to search across products, customers, and reviews.</p>
      ) : (
        <>
          <Group title="PRODUCTS" count={prod.length}>
            {prod.map((p) => (
              <Link key={p.sku} href={`/admin/products/${p.sku}`} style={{ ...row, color: "#E8E2D5" }}>
                <span style={{ fontFamily: BODY, fontSize: 13 }}>{p.name} <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>· {p.status}</span></span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD }}>${p.base_price}</span>
              </Link>
            ))}
          </Group>

          <Group title="CUSTOMERS" count={customerList.length}>
            {customerList.map(([email, src]) => (
              <Link key={email} href={`/admin/customers/${encodeURIComponent(email)}`} style={{ ...row, color: "#C3BDB1" }}>
                <span style={{ fontFamily: BODY, fontSize: 13, wordBreak: "break-all" }}>{email}</span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase" }}>{src}</span>
              </Link>
            ))}
          </Group>

          <Group title="REVIEWS" count={revs.length}>
            {revs.map((r) => (
              <Link key={r.id} href="/admin/reviews" style={{ ...row, color: "#C3BDB1" }}>
                <span style={{ fontFamily: BODY, fontSize: 13 }}>{r.title || "Review"} <span style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A" }}>· {r.name}</span></span>
                <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase" }}>{r.status}</span>
              </Link>
            ))}
          </Group>
        </>
      )}
    </div>
  );
}
