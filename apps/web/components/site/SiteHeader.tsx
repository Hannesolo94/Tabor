"use client";

// Persistent top nav. Two product axes per the IA: Collections (personas) and
// Gear (product types). Plus the bag, wired to the shared cart.
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { TaborSeal } from "@/components/TaborSeal";
import { RegionSwitcher } from "./RegionSwitcher";
import { CATEGORIES, PERSONAS, type Persona, type Category } from "@/lib/catalog";
import type { BrandLogos } from "@/lib/brand";
import { GOLD, MONO, PIRATA } from "@/lib/ui";

type Menu = null | "collections" | "gear";

export function SiteHeader({ personas = PERSONAS, categories = CATEGORIES, collections = [], logo }: { personas?: Persona[]; categories?: Category[]; collections?: { slug: string; title: string }[]; logo?: BrandLogos }) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState<Menu>(null);
  const [mobile, setMobile] = useState(false);
  const close = () => setMenu(null);

  const linkStyle: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: "#B8B2A6", textTransform: "uppercase", textDecoration: "none", padding: 0 };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(10,10,10,0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,169,97,0.16)" }} onMouseLeave={close}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" onClick={close} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          {logo?.wordmark ? (
            <img src={logo.wordmark} alt="Tabor" style={{ height: logo.wordmarkHeight || 36, width: "auto", display: "block" }} />
          ) : (
            <>
              {logo?.icon
                ? <img src={logo.icon} alt="" style={{ width: 28, height: 28, objectFit: "contain", display: "block" }} />
                : <TaborSeal id="nav-seal" size={28} />}
              <span style={{ fontFamily: PIRATA, fontSize: 23, color: GOLD }}>Tabor</span>
            </>
          )}
        </Link>

        {/* desktop nav */}
        <div className="tabor-desktop-nav" style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href="/shop" style={linkStyle} onClick={close}>Shop All</Link>
          <button style={linkStyle} onClick={() => setMenu(menu === "collections" ? null : "collections")}>Collections ▾</button>
          <button style={linkStyle} onClick={() => setMenu(menu === "gear" ? null : "gear")}>Gear ▾</button>
          <Link href="/#creed" style={linkStyle} onClick={close}>The Creed</Link>
          <Link href="/about" style={linkStyle} onClick={close}>About</Link>
          <form action="/shop" method="get" style={{ display: "flex" }}>
            <input name="q" placeholder="Search..." aria-label="Search products" style={{ fontFamily: MONO, fontSize: 11, color: "#E8E2D5", background: "rgba(21,21,26,0.7)", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "8px 12px", width: 120 }} />
          </form>
          <RegionSwitcher />
          <button onClick={() => setOpen(true)} style={{ ...linkStyle, color: GOLD, border: `1px solid ${GOLD}59`, background: "rgba(201,169,97,0.06)", borderRadius: 12, padding: "9px 16px" }}>
            Bag{count ? ` · ${count}` : ""}
          </button>
        </div>

        {/* mobile toggle */}
        <button className="tabor-mobile-toggle" onClick={() => setMobile((m) => !m)} style={{ flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 22, height: 2, background: GOLD }} />)}
        </button>
      </div>

      {/* desktop dropdown panel */}
      {menu && (
        <div style={{ borderTop: "1px solid rgba(201,169,97,0.18)", background: "rgba(12,12,16,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "18px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            {menu === "collections"
              ? [
                  ...personas.map((p) => (
                    <Link key={p.id} href={`/collections/${p.id}`} onClick={close} style={{ textDecoration: "none" }}>
                      <div style={{ fontFamily: MONO, fontSize: 8.5, color: p.accent, letterSpacing: "0.16em", textTransform: "uppercase" }}>{p.tag}</div>
                      <div style={{ fontFamily: PIRATA, fontSize: 22, color: "#E8E2D5", margin: "2px 0 4px" }}>{p.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", lineHeight: 1.5 }}>{p.blurb}</div>
                    </Link>
                  )),
                  ...collections.map((c) => (
                    <Link key={c.slug} href={`/collection/${c.slug}`} onClick={close} style={{ textDecoration: "none" }}>
                      <div style={{ fontFamily: MONO, fontSize: 8.5, color: GOLD, letterSpacing: "0.16em", textTransform: "uppercase" }}>Collection</div>
                      <div style={{ fontFamily: PIRATA, fontSize: 22, color: "#E8E2D5", margin: "2px 0 4px" }}>{c.title}</div>
                    </Link>
                  )),
                ]
              : categories.map((c) => (
                  <Link key={c.id} href={`/shop?type=${c.id}`} onClick={close} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD, letterSpacing: "0.12em", textTransform: "uppercase" }}>{c.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#7A746A", lineHeight: 1.45 }}>{c.blurb}</span>
                  </Link>
                ))}
          </div>
        </div>
      )}

      {/* mobile stacked menu */}
      {mobile && (
        <div className="tabor-mobile-menu" style={{ borderTop: "1px solid rgba(201,169,97,0.18)", padding: "10px 24px 18px" }}>
          <form action="/shop" method="get" style={{ display: "flex", gap: 6, margin: "8px 0 12px" }}>
            <input name="q" placeholder="Search products..." style={{ flex: 1, fontFamily: MONO, fontSize: 12, color: "#E8E2D5", background: "rgba(21,21,26,0.7)", border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "11px 13px" }} />
            <button type="submit" style={{ fontFamily: MONO, fontSize: 10, color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", border: "none", borderRadius: 12, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", fontWeight: 700, padding: "0 16px", cursor: "pointer", textTransform: "uppercase" }}>Go</button>
          </form>
          <Link href="/shop" onClick={() => setMobile(false)} style={{ ...linkStyle, display: "block", padding: "12px 0", fontSize: 13 }}>Shop All</Link>
          <Link href="/about" onClick={() => setMobile(false)} style={{ ...linkStyle, display: "block", padding: "12px 0", fontSize: 13 }}>About</Link>
          <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", margin: "8px 0 4px" }}>COLLECTIONS</div>
          {personas.map((p) => <Link key={p.id} href={`/collections/${p.id}`} onClick={() => setMobile(false)} style={{ ...linkStyle, display: "block", padding: "8px 0", fontSize: 12, color: "#E8E2D5" }}>{p.name}</Link>)}
          {collections.map((c) => <Link key={c.slug} href={`/collection/${c.slug}`} onClick={() => setMobile(false)} style={{ ...linkStyle, display: "block", padding: "8px 0", fontSize: 12, color: "#E8E2D5" }}>{c.title}</Link>)}
          <div style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.16em", margin: "10px 0 4px" }}>GEAR</div>
          {categories.map((c) => <Link key={c.id} href={`/shop?type=${c.id}`} onClick={() => setMobile(false)} style={{ ...linkStyle, display: "block", padding: "8px 0", fontSize: 12, color: "#E8E2D5" }}>{c.name}</Link>)}
          <button onClick={() => { setMobile(false); setOpen(true); }} style={{ ...linkStyle, marginTop: 12, color: "#1a1408", background: "linear-gradient(180deg, #f0d89a, #c9a961)", borderRadius: 14, boxShadow: "0 8px 24px -6px rgba(201,169,97,0.5), inset 0 1px 0 rgba(255,255,255,0.45)", fontWeight: 700, padding: "14px", width: "100%", fontSize: 12 }}>View Bag{count ? ` · ${count}` : ""}</button>
        </div>
      )}
    </div>
  );
}
