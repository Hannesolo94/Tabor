"use client";

// Bulk product picker for a collection: search the whole catalog, tick products
// to include, save. (The "add products to this collection" feature.)
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { setCollectionProducts } from "./actions";
import { personaById, categoryById } from "@/lib/catalog";
import { GOLD, MONO, BODY } from "@/lib/ui";

export interface PickerProduct { sku: string; name: string; collection: string | null; category: string | null; status: string | null }

export function ProductPicker({ collectionId, products, initial }: { collectionId: string; products: PickerProduct[]; initial: string[] }) {
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

  const toggle = (sku: string) => setSel((s) => { const n = new Set(s); n.has(sku) ? n.delete(sku) : n.add(sku); return n; });

  async function save() {
    setSaving(true);
    setSaved(false);
    await setCollectionProducts(collectionId, [...sel]);
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the catalog…" style={{ flex: 1, minWidth: 200, fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "9px 12px" }} />
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.1em" }}>{sel.size} SELECTED</span>
        <button onClick={save} disabled={saving} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "9px 16px", cursor: "pointer" }}>{saving ? "Saving…" : saved ? "Saved ✓" : "Save selection"}</button>
      </div>
      <div style={{ border: "1px solid rgba(201,169,97,0.14)", background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", overflow: "hidden", maxHeight: 420, overflowY: "auto" }}>
        {filtered.map((p, i) => (
          <label key={p.sku} style={{ display: "grid", gridTemplateColumns: "26px 1fr 1fr 70px", alignItems: "center", padding: "10px 14px", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", background: sel.has(p.sku) ? "rgba(201,169,97,0.06)" : "transparent" }}>
            <input type="checkbox" checked={sel.has(p.sku)} onChange={() => toggle(p.sku)} />
            <span style={{ fontFamily: BODY, fontSize: 13, color: "#E8E2D5" }}>{p.name}</span>
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: "#9A948A", textTransform: "uppercase" }}>{personaById(p.collection ?? "")?.name ?? p.collection} · {categoryById(p.category ?? "")?.name ?? p.category}</span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: p.status === "live" ? "#7BBF7B" : "#8A847A" }}>{p.status}</span>
          </label>
        ))}
        {filtered.length === 0 && <div style={{ padding: 16, fontFamily: BODY, fontSize: 13, color: "#8A847A" }}>No products match.</div>}
      </div>
    </div>
  );
}
