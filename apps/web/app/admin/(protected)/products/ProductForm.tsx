"use client";

// Create/edit product form. Used by both /products/new and /products/[sku].
import { useActionState } from "react";
import { saveProduct, type SaveState } from "./actions";
import { CATEGORIES, PERSONAS, type Product } from "@/lib/catalog";
import { GOLD, MONO, BODY } from "@/lib/ui";

const initial: SaveState = {};

const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, color: "#8A847A", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 13, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "10px 12px", width: "100%" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

export function ProductForm({ product, isNew }: { product?: Partial<Product> & { status?: string; inventory?: number; trackInventory?: boolean; sort?: number; cost?: number; priceZa?: number }; isNew?: boolean }) {
  const [state, action, pending] = useActionState(saveProduct, initial);
  const p = product ?? {};

  return (
    <form action={action} style={{ display: "grid", gap: 18, maxWidth: 760 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label={isNew ? "SKU (blank = auto from name)" : "SKU (unique id)"}>
          <input name="sku" defaultValue={p.sku ?? ""} readOnly={!isNew} placeholder={isNew ? "auto-generated" : ""} style={{ ...inp, opacity: isNew ? 1 : 0.6 }} />
        </Field>
        <Field label="Name">
          <input name="name" defaultValue={p.name ?? ""} placeholder="Sons of Fire Tee" style={inp} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field label="Collection (persona)">
          <select name="collection" defaultValue={p.persona ?? "sentinel"} style={inp}>
            {PERSONAS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        <Field label="Type (category)">
          <select name="category" defaultValue={p.category ?? "apparel"} style={inp}>
            {CATEGORIES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        <Field label="Price (USD)">
          <input name="base_price" type="number" step="1" min="0" defaultValue={p.price ?? 0} style={inp} />
        </Field>
        <Field label="Cost / supplier (for margin)">
          <input name="cost" type="number" step="0.01" min="0" defaultValue={p.cost ?? 0} style={inp} />
        </Field>
        <Field label="SA price (ZAR, 0 = use intl)">
          <input name="price_za" type="number" step="1" min="0" defaultValue={p.priceZa ?? 0} style={inp} />
        </Field>
      </div>

      <Field label="Short blurb (card line)">
        <input name="blurb" defaultValue={p.blurb ?? ""} placeholder="Heavyweight, back-print wordmark." style={inp} />
      </Field>
      <Field label="Description (product page)">
        <textarea name="description" defaultValue={p.description ?? ""} rows={4} style={{ ...inp, resize: "vertical" }} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Spec note">
          <input name="note" defaultValue={p.note ?? ""} placeholder="240gsm heavyweight" style={inp} />
        </Field>
        <Field label="Art tagline">
          <input name="tagline" defaultValue={p.tagline ?? ""} placeholder="Back-print wordmark" style={inp} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Sizes (comma separated, blank = none)">
          <input name="sizes" defaultValue={(p.sizes ?? []).join(", ")} placeholder="S, M, L, XL, 2XL" style={inp} />
        </Field>
        <Field label="Image URL (optional, overrides art)">
          <input name="image_url" defaultValue={p.imageUrl ?? ""} placeholder="https://..." style={inp} />
        </Field>
      </div>

      {/* placeholder-art controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field label="Art background (hex)">
          <input name="tone" defaultValue={p.tone ?? "#15151A"} style={inp} />
        </Field>
        <Field label="Mark color (hex)">
          <input name="ink" defaultValue={p.ink ?? "#C9A961"} style={inp} />
        </Field>
        <Field label="Mark">
          <select name="mark" defaultValue={p.mark ?? "seal"} style={inp}>
            <option value="seal">Seal</option>
            <option value="word">Wordmark</option>
          </select>
        </Field>
      </div>

      {/* stock + visibility */}
      <div style={{ borderTop: "1px solid rgba(201,169,97,0.14)", paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, alignItems: "end" }}>
        <Field label="Status">
          <select name="status" defaultValue={p.status ?? "draft"} style={inp}>
            <option value="live">Live (visible)</option>
            <option value="draft">Draft (hidden)</option>
          </select>
        </Field>
        <Field label="Sort order">
          <input name="sort" type="number" defaultValue={p.sort ?? 0} style={inp} />
        </Field>
        <label style={{ fontFamily: MONO, fontSize: 11, color: "#C3BDB1", display: "flex", gap: 8, alignItems: "center", paddingBottom: 10 }}>
          <input type="checkbox" name="featured" defaultChecked={!!p.featured} /> Featured on home
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "end" }}>
        <label style={{ fontFamily: MONO, fontSize: 11, color: "#C3BDB1", display: "flex", gap: 8, alignItems: "center", paddingBottom: 10 }}>
          <input type="checkbox" name="track_inventory" defaultChecked={!!p.trackInventory} /> Track stock quantity
        </label>
        <Field label="Quantity in stock (0 = sold out when tracking)">
          <input name="inventory" type="number" min="0" defaultValue={p.inventory ?? 0} style={inp} />
        </Field>
      </div>

      {state.error && <p style={{ fontFamily: MONO, fontSize: 12, color: "#C03A3A" }}>{state.error}</p>}

      <div>
        <button type="submit" disabled={pending} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "13px 28px", cursor: "pointer" }}>
          {pending ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
