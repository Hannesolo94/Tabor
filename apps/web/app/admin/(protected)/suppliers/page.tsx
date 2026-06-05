import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { SyncButton } from "./SyncButton";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const sb = await supabaseServer();
  const { count: pfCount } = await sb.from("products").select("sku", { count: "exact", head: true }).eq("source", "printful");

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ FULFILMENT ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 8px" }}>Suppliers</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 28px", maxWidth: 620 }}>
        Connect print-on-demand suppliers. Imported products land in your catalog as drafts so you can assign personas and publish them into your own layout.
      </p>

      {/* Printful */}
      <div style={{ border: "1px solid rgba(201,169,97,0.18)", background: "#0E0E12", padding: "24px 24px", maxWidth: 620, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 18, color: "#E8E2D5" }}>Printful</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "#7BBF7B", letterSpacing: "0.08em", marginTop: 4 }}>● CONNECTED · INTERNATIONAL</div>
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
      <div style={{ border: "1px solid rgba(201,169,97,0.12)", background: "#0C0C10", padding: "20px 24px", maxWidth: 620, opacity: 0.7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 16, color: "#C3BDB1" }}>South African PoD</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "#7A746A", letterSpacing: "0.08em", marginTop: 4 }}>○ NOT CONNECTED · LOCAL (ZA)</div>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 8, color: GOLD, letterSpacing: "0.1em", border: `1px solid ${GOLD}44`, padding: "3px 6px" }}>SOON</span>
        </div>
        <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#7A746A", lineHeight: 1.6, margin: "12px 0 0" }}>
          A local supplier for South African orders (faster, no customs, ZAR pricing). Added once a provider is chosen. See <Link href="/admin/products" style={{ color: GOLD, textDecoration: "none" }}>Products</Link>.
        </p>
      </div>
    </div>
  );
}
