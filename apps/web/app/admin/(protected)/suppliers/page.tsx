import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { SyncButton } from "./SyncButton";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const connectedPill: React.CSSProperties = { fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 8, color: "#5FB07A", border: "1px solid rgba(95,176,122,0.4)", background: "rgba(95,176,122,0.08)", display: "inline-block" };
const pendingPill: React.CSSProperties = { fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 8, color: "#C9A961", border: "1px solid rgba(201,169,97,0.4)", background: "rgba(201,169,97,0.08)", display: "inline-block" };

export default async function SuppliersPage() {
  const sb = await supabaseServer();
  const { count: pfCount } = await sb.from("products").select("sku", { count: "exact", head: true }).eq("source", "printful");

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ FULFILMENT ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Suppliers</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0", maxWidth: 620 }}>
          Connect print-on-demand suppliers. Imported products land in your catalog as drafts so you can assign personas and publish them into your own layout.
        </p>
      </div>

      {/* Printful */}
      <div className="admin-card" style={{ ...cardStyle, maxWidth: 620, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 6 }}>Printful</div>
            <span style={connectedPill}>● CONNECTED · INTERNATIONAL</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: GOLD }}>{pfCount ?? 0}</div>
            <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#7A746A", letterSpacing: "0.12em" }}>IMPORTED</div>
          </div>
        </div>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", lineHeight: 1.6, margin: "16px 0 18px" }}>
          Pull products from your Printful store. New ones arrive as <strong style={{ color: "#C3BDB1" }}>drafts</strong>; re-syncing updates images, prices, and variants without touching the personas and copy you set.
        </p>
        <SyncButton />
      </div>

      {/* SA PoD (planned) */}
      <div className="admin-card" style={{ ...cardStyle, maxWidth: 620, opacity: 0.7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#C3BDB1", marginBottom: 6 }}>South African PoD</div>
            <span style={pendingPill}>○ NOT CONNECTED · LOCAL (ZA)</span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 8, color: GOLD, letterSpacing: "0.1em", border: `1px solid ${GOLD}44`, borderRadius: 8, padding: "3px 6px" }}>SOON</span>
        </div>
        <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#7A746A", lineHeight: 1.6, margin: "12px 0 0" }}>
          A local supplier for South African orders (faster, no customs, ZAR pricing). Added once a provider is chosen. See <Link href="/admin/products" style={{ color: GOLD, textDecoration: "none" }}>Products</Link>.
        </p>
      </div>
    </div>
  );
}
