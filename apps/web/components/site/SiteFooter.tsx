// Site footer. Reads store settings (social links) so they render on the site.
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { TaborSeal } from "@/components/TaborSeal";
import { CATEGORIES, PERSONAS } from "@/lib/catalog";
import { GOLD, MONO, PIRATA } from "@/lib/ui";

async function getStore(): Promise<Record<string, string>> {
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    const { data } = await sb.from("app_settings").select("value").eq("key", "store").maybeSingle();
    return (data?.value ?? {}) as Record<string, string>;
  } catch {
    return {};
  }
}

const IG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
);
const TT = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2 1.6 3.6 3.5 3.9v2.6c-1.3.1-2.6-.3-3.7-1v6.1a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a2.9 2.9 0 1 0 2 2.8V3h2.9z" /></svg>
);
const XI = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5-6.6L5.4 22H2.3l7.8-8.9L1.5 2h7l4.5 6 5.9-6zm-2.4 18h1.7L7.6 3.8H5.8L16.5 20z" /></svg>
);

export async function SiteFooter() {
  const store = await getStore();
  const socials: { href: string; label: string; icon: React.ReactNode }[] = [];
  if (store.instagram) socials.push({ href: store.instagram, label: "Instagram", icon: IG });
  if (store.tiktok) socials.push({ href: store.tiktok, label: "TikTok", icon: TT });
  if (store.x) socials.push({ href: store.x, label: "X", icon: XI });

  const col: React.CSSProperties = { fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.08em", textDecoration: "none", display: "block", padding: "5px 0", textTransform: "uppercase" };
  const head: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.18em", marginBottom: 8, textTransform: "uppercase" };

  return (
    <footer style={{ borderTop: "1px solid rgba(201,169,97,0.14)", padding: "48px 24px 36px", background: "#0A0A0A" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <TaborSeal id="ft-seal" size={28} />
            <span style={{ fontFamily: PIRATA, fontSize: 22, color: GOLD }}>Tabor</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.14em", lineHeight: 1.8 }}>SONS OF FIRE<br />FORGED NOT BOUGHT</div>
          {socials.length > 0 && (
            <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{ color: GOLD, display: "inline-flex" }}>{s.icon}</a>
              ))}
            </div>
          )}
        </div>
        <div>
          <div style={head}>Collections</div>
          {PERSONAS.map((p) => <Link key={p.id} href={`/collections/${p.id}`} style={col}>{p.name}</Link>)}
        </div>
        <div>
          <div style={head}>Gear</div>
          {CATEGORIES.slice(0, 6).map((c) => <Link key={c.id} href={`/shop?type=${c.id}`} style={col}>{c.name}</Link>)}
        </div>
        <div>
          <div style={head}>The Brotherhood</div>
          <Link href="/shop" style={col}>Shop All</Link>
          <Link href="/#app" style={col}>The App</Link>
          <Link href="/#creed" style={col}>The Creed</Link>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "28px auto 0", paddingTop: 18, borderTop: "1px solid rgba(201,169,97,0.1)", fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.14em", textAlign: "center", lineHeight: 1.9 }}>
        FULFILLED LOCALLY + WORLDWIDE · PRINTED ON DEMAND
        <br />
        <span style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          {[["Shipping", "/shipping"], ["Returns", "/returns"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([l, h]) => (
            <Link key={h} href={h} style={{ color: "#8A847A", textDecoration: "none" }}>{l.toUpperCase()}</Link>
          ))}
        </span>
        <br />© 2026 TABOR BROTHERHOOD
      </div>
    </footer>
  );
}
