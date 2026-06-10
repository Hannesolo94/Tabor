"use client";

// Product picker for a bundle: search the catalog, tick products, save. Shows the
// running bundle total + savings (sum of member prices x discount).
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { setBundleProducts } from "./actions";
import { personaById, categoryById } from "@/lib/catalog";
import { GOLD, MONO, BODY } from "@/lib/ui";

export interface PickerProduct { sku: string; name: string; collection: string | null; category: string | null; status: string | null; price: number }

export function BundleProductPicker({ bundleId, products, initial, discountPercent }: { bundleId: string; products: PickerProduct[]; initial: string[]; discountPercent: number }) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set(initial));
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return products;
    return products.filter((p) => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t));
  }, [q, products]);

  const sum = useMemo(() => products.filter((p) => sel.has(p.sku)).reduce((s, p) => s + (Number(p.price) || 0), 0), [sel, products]);
  const bundlePrice = sum * (1 - (discountPercent || 0) / 100);
  const savings = sum - bundlePrice;
  const toggle = (sku: string) => setSel((s) => { const n = new Set(s); n.has(sku) ? n.delete(sku) : n.add(sku); return n; });

  async function save() {
    setSaving(true); setSaved(false);
    await setBundleProducts(bundleId, [...sel]);
    setSaving(false); setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the catalog…" style={{ flex: 1, minWidth: 200, fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "9px 12px" }} />
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.1em" }}>{sel.size} IN BUNDLE</span>
        <button onClick={save} disabled={saving} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "9px 16px", cursor: "pointer" }}>{saving ? "Saving…" : saved ? "Saved ✓" : "Save selection"}</button>
      </div>

      {/* running price summary (USD base prices) */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", padding: "11px 14px", marginBottom: 10, borderRadius: 12, border: `1px solid ${GOLD}29`, background: "linear-gradient(160deg, rgba(40,36,20,0.55), rgba(15,15,20,0.5))" }}>
        <Stat label="Items" value={String(sel.size)} />
        <Stat label="Full price" value={`$${sum.toFixed(2)}`} strike />
        <Stat label={`Bundle (${discountPercent || 0}% off)`} value={`$${bundlePrice.toFixed(2)}`} gold />
        <Stat label="They save" value={`$${savings.toFixed(2)}`} />
        <span style={{ fontFamily: MONO, fontSize: 8.5, color: "#6F6A60", letterSpacing: "0.08em", alignSelf: "center", marginLeft: "auto" }}>USD BASE · REGION PRICES SCALE AUTOMATICALLY</span>
      </div>

      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden", maxHeight: 420, overflowY: "auto" }}>
        {filtered.map((p, i) => (
          <label key={p.sku} style={{ display: "grid", gridTemplateColumns: "26px 1fr 1fr 64px 60px", alignItems: "center", padding: "10px 14px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", background: sel.has(p.sku) ? "rgba(201,169,97,0.06)" : "transparent" }}>
            <input type="checkbox" checked={sel.has(p.sku)} onChange={() => toggle(p.sku)} />
            <span style={{ fontFamily: BODY, fontSize: 13, color: "#E8E2D5" }}>{p.name}</span>
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#9A948A", textTransform: "uppercase" }}>{personaById(p.collection ?? "")?.name ?? p.collection} · {categoryById(p.category ?? "")?.name ?? p.category}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: GOLD }}>${(Number(p.price) || 0).toFixed(0)}</span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: p.status === "live" ? "#7BBF7B" : "#8A847A" }}>{p.status}</span>
          </label>
        ))}
        {filtered.length === 0 && <div style={{ padding: 16, fontFamily: BODY, fontSize: 13, color: "#8A847A" }}>No products match.</div>}
      </div>
    </div>
  );
}

function Stat({ label, value, gold, strike }: { label: string; value: string; gold?: boolean; strike?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 15, color: gold ? GOLD : "#E8E2D5", textDecoration: strike ? "line-through" : "none", opacity: strike ? 0.6 : 1 }}>{value}</div>
    </div>
  );
}
