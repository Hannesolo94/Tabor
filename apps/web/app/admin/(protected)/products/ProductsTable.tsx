"use client";

// Products table with multi-select + a bulk action bar (assign persona/type,
// publish/unpublish, feature/unfeature across many products at once).
import { useState } from "react";
import Link from "next/link";
import { bulkUpdate, bulkDelete } from "./actions";
import { CATEGORIES, PERSONAS, categoryById, personaById } from "@/lib/catalog";
import { GOLD, MONO, BODY } from "@/lib/ui";

export interface Row {
  sku: string;
  name: string;
  collection: string | null;
  category: string | null;
  base_price: number | null;
  status: string | null;
  featured: boolean | null;
  inventory: number | null;
  track_inventory: boolean | null;
}

const GRID = "28px 2fr 1fr 1fr 70px 90px 80px";

export function ProductsTable({ rows }: { rows: Row[] }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const allOn = rows.length > 0 && sel.size === rows.length;
  const toggle = (sku: string) => setSel((s) => { const n = new Set(s); n.has(sku) ? n.delete(sku) : n.add(sku); return n; });
  const toggleAll = () => setSel(allOn ? new Set() : new Set(rows.map((r) => r.sku)));
  const skus = [...sel];

  const hidden = skus.map((sku) => <input key={sku} type="hidden" name="skus" value={sku} />);
  const actionBtn: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C3BDB1", background: "rgba(201,169,97,0.06)", border: `1px solid ${GOLD}44`, borderRadius: 10, padding: "8px 10px", cursor: "pointer" };
  const sub: React.CSSProperties = { fontFamily: BODY, fontSize: 12, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "7px 8px" };

  return (
    <div>
      {/* bulk bar */}
      {sel.size > 0 && (
        <div style={{ border: `1px solid ${GOLD}55`, background: "linear-gradient(160deg, rgba(40,36,20,0.7), rgba(18,18,12,0.6))", borderRadius: 14, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "12px 16px", marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.1em" }}>{sel.size} SELECTED</span>

          <form action={bulkUpdate} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {hidden}<input type="hidden" name="field" value="collection" />
            <select name="value" defaultValue="sentinel" style={sub}>{PERSONAS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <button type="submit" style={actionBtn}>Set Collection</button>
          </form>

          <form action={bulkUpdate} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {hidden}<input type="hidden" name="field" value="category" />
            <select name="value" defaultValue="apparel" style={sub}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <button type="submit" style={actionBtn}>Set Type</button>
          </form>

          <form action={bulkUpdate}>{hidden}<input type="hidden" name="field" value="status" /><input type="hidden" name="value" value="live" /><button type="submit" style={actionBtn}>Publish</button></form>
          <form action={bulkUpdate}>{hidden}<input type="hidden" name="field" value="status" /><input type="hidden" name="value" value="draft" /><button type="submit" style={actionBtn}>Unpublish</button></form>
          <form action={bulkUpdate}>{hidden}<input type="hidden" name="field" value="featured" /><input type="hidden" name="value" value="true" /><button type="submit" style={actionBtn}>Feature</button></form>
          <form action={bulkUpdate}>{hidden}<input type="hidden" name="field" value="featured" /><input type="hidden" name="value" value="false" /><button type="submit" style={actionBtn}>Unfeature</button></form>
          <form action={bulkDelete} onSubmit={(e) => { if (!confirm(`Delete ${sel.size} product(s)? This permanently removes them and cannot be undone.`)) e.preventDefault(); }} style={{ marginLeft: "auto" }}>{hidden}<button type="submit" style={{ ...actionBtn, color: "#ff8c8c", border: "1px solid rgba(192,58,58,0.55)", background: "rgba(122,31,31,0.18)" }}>Delete</button></form>
        </div>
      )}

      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: GRID, padding: "12px 18px", borderBottom: "1px solid rgba(201,169,97,0.12)", fontFamily: MONO, fontSize: 9, color: "#7A746A", letterSpacing: "0.12em", alignItems: "center" }}>
          <input type="checkbox" checked={allOn} onChange={toggleAll} />
          <span>NAME</span><span>COLLECTION</span><span>TYPE</span><span>PRICE</span><span>STATUS</span><span>STOCK</span>
        </div>
        {rows.map((r, i) => {
          const live = r.status === "live";
          const stock = r.track_inventory ? ((r.inventory ?? 0) > 0 ? `${r.inventory}` : "SOLD OUT") : "—";
          return (
            <div key={r.sku} style={{ display: "grid", gridTemplateColumns: GRID, alignItems: "center", padding: "11px 18px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none", background: sel.has(r.sku) ? "rgba(201,169,97,0.06)" : "transparent" }}>
              <input type="checkbox" checked={sel.has(r.sku)} onChange={() => toggle(r.sku)} />
              <Link href={`/admin/products/${r.sku}`} style={{ fontFamily: BODY, fontSize: 13, color: "#E8E2D5", textDecoration: "none" }}>
                {r.name}
                {r.featured && <span style={{ fontFamily: MONO, fontSize: 7.5, color: GOLD, letterSpacing: "0.1em", border: `1px solid ${GOLD}44`, borderRadius: 8, padding: "1px 4px", marginLeft: 8 }}>FEATURED</span>}
              </Link>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#9A948A", textTransform: "uppercase" }}>{personaById(r.collection ?? "")?.name ?? r.collection}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: "#9A948A", textTransform: "uppercase" }}>{categoryById(r.category ?? "")?.name ?? r.category}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD }}>${r.base_price}</span>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", color: live ? "#7BBF7B" : "#8A847A" }}>{live ? "● LIVE" : "○ DRAFT"}</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: stock === "SOLD OUT" ? "#C03A3A" : "#9A948A" }}>{stock}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
