"use client";

// Create/edit product form — Shopify-style two-column: main details (left) + Status /
// Organization rail (right). Used by /products/new and /products/[sku].
import { useActionState } from "react";
import { saveProduct, type SaveState } from "./actions";
import { CATEGORIES, PERSONAS, type Product } from "@/lib/catalog";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

const initial: SaveState = {};

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "rgba(15,15,20,0.6)", border: `1px solid ${GOLD}33`, borderRadius: 10, padding: "10px 12px", width: "100%" };
const check: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#C3BDB1", display: "flex", gap: 8, alignItems: "center" };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-card" style={cardStyle}>
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 }}>{title}</div>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={lbl}>{label}</label>{children}</div>;
}

export function ProductForm({ product, isNew }: { product?: Partial<Product> & { status?: string; inventory?: number; trackInventory?: boolean; sort?: number; cost?: number; priceZa?: number }; isNew?: boolean }) {
  const [state, action, pending] = useActionState(saveProduct, initial);
  const p = product ?? {};

  return (
    <form action={action}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 18, alignItems: "start" }}>
        {/* main column */}
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Title & details">
            <Field label="Name"><input name="name" defaultValue={p.name ?? ""} placeholder="Sons of Fire Tee" style={inp} /></Field>
            <Field label="Short blurb (card line)"><input name="blurb" defaultValue={p.blurb ?? ""} placeholder="Heavyweight, back-print wordmark." style={inp} /></Field>
            <Field label="Description (product page)"><textarea name="description" defaultValue={p.description ?? ""} rows={4} style={{ ...inp, resize: "vertical" }} /></Field>
          </Card>

          <Card title="Pricing">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Price (USD)"><input name="base_price" type="number" step="1" min="0" defaultValue={p.price ?? 0} style={inp} /></Field>
              <Field label="Cost (margin)"><input name="cost" type="number" step="0.01" min="0" defaultValue={p.cost ?? 0} style={inp} /></Field>
              <Field label="SA price (ZAR, 0 = intl)"><input name="price_za" type="number" step="1" min="0" defaultValue={p.priceZa ?? 0} style={inp} /></Field>
            </div>
          </Card>

          <Card title="Inventory">
            <label style={check}><input type="checkbox" name="track_inventory" defaultChecked={!!p.trackInventory} /> Track stock quantity</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Quantity in stock (0 = sold out)"><input name="inventory" type="number" min="0" defaultValue={p.inventory ?? 0} style={inp} /></Field>
              <Field label="Sizes (comma separated)"><input name="sizes" defaultValue={(p.sizes ?? []).join(", ")} placeholder="S, M, L, XL, 2XL" style={inp} /></Field>
            </div>
          </Card>

          <Card title="Artwork">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Background (hex)"><input name="tone" defaultValue={p.tone ?? "#15151A"} style={inp} /></Field>
              <Field label="Mark color (hex)"><input name="ink" defaultValue={p.ink ?? "#C9A961"} style={inp} /></Field>
              <Field label="Mark"><select name="mark" defaultValue={p.mark ?? "seal"} style={inp}><option value="seal">Seal</option><option value="word">Wordmark</option></select></Field>
            </div>
            <Field label="Image URL (optional, overrides art)"><input name="image_url" defaultValue={p.imageUrl ?? ""} placeholder="https://..." style={inp} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Art tagline"><input name="tagline" defaultValue={p.tagline ?? ""} placeholder="Back-print wordmark" style={inp} /></Field>
              <Field label="Spec note"><input name="note" defaultValue={p.note ?? ""} placeholder="240gsm heavyweight" style={inp} /></Field>
            </div>
          </Card>
        </div>

        {/* right rail */}
        <div style={{ display: "grid", gap: 14, position: "sticky", top: 20 }}>
          <Card title="Status">
            <Field label="Visibility"><select name="status" defaultValue={p.status ?? "draft"} style={inp}><option value="live">Live (visible)</option><option value="draft">Draft (hidden)</option></select></Field>
            <label style={{ ...check, marginTop: 4 }}><input type="checkbox" name="featured" defaultChecked={!!p.featured} /> Featured on home</label>
          </Card>
          <Card title="Organization">
            <Field label="Collection (persona)"><select name="collection" defaultValue={p.persona ?? "sentinel"} style={inp}>{PERSONAS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
            <Field label="Type (category)"><select name="category" defaultValue={p.category ?? "apparel"} style={inp}>{CATEGORIES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
            <Field label="Sort order"><input name="sort" type="number" defaultValue={p.sort ?? 0} style={inp} /></Field>
            <Field label={isNew ? "SKU (blank = auto)" : "SKU (unique id)"}><input name="sku" defaultValue={p.sku ?? ""} readOnly={!isNew} placeholder={isNew ? "auto-generated" : ""} style={{ ...inp, opacity: isNew ? 1 : 0.6 }} /></Field>
          </Card>
        </div>
      </div>

      {state.error && <p style={{ fontFamily: MONO, fontSize: 12, color: "#C03A3A", marginTop: 14 }}>{state.error}</p>}

      <div style={{ marginTop: 18 }}>
        <button type="submit" disabled={pending} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "13px 28px", cursor: "pointer" }}>
          {pending ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
