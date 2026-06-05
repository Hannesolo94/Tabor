// Discount codes. Create/manage codes (e.g. the FIRE10 popup code). Codes are
// validated + applied at checkout once payments are live.
import { supabaseServer } from "@/lib/supabase/server";
import { addDiscount, deleteDiscount, saveDiscount } from "./actions";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 12, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "8px 10px", width: "100%" };
const btn: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "9px 14px", cursor: "pointer" };

interface Row { id: string; code: string; percent: number; active: boolean; usage_limit: number | null; used_count: number; once_per_email: boolean; note: string | null }

function Fields({ d }: { d?: Row }) {
  return (
    <>
      <div><label style={lbl}>Code</label><input name="code" defaultValue={d?.code ?? ""} placeholder="FIRE10" style={{ ...inp, textTransform: "uppercase" }} /></div>
      <div><label style={lbl}>Percent off</label><input name="percent" type="number" min="1" max="100" defaultValue={d?.percent ?? 10} style={inp} /></div>
      <div><label style={lbl}>Usage limit (blank = unlimited)</label><input name="usage_limit" type="number" min="1" defaultValue={d?.usage_limit ?? ""} style={inp} /></div>
      <div><label style={lbl}>Note</label><input name="note" defaultValue={d?.note ?? ""} placeholder="e.g. launch promo" style={inp} /></div>
      <label style={{ fontFamily: MONO, fontSize: 10, color: "#C3BDB1", display: "flex", gap: 6, alignItems: "center", paddingTop: 18 }}><input type="checkbox" name="active" defaultChecked={d ? d.active : true} /> Active</label>
      <label style={{ fontFamily: MONO, fontSize: 10, color: "#C3BDB1", display: "flex", gap: 6, alignItems: "center", paddingTop: 18 }}><input type="checkbox" name="once_per_email" defaultChecked={d ? d.once_per_email : true} /> Once per email</label>
    </>
  );
}

export default async function AdminDiscounts() {
  const sb = await supabaseServer();
  const { data } = await sb.from("discount_codes").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ PROMOS ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Discounts</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 24px" }}>Create discount codes. They apply at checkout once payments are live. (Price drops on individual products: set on the product itself.)</p>

      <div style={{ display: "grid", gap: 4 }}>
        {rows.map((d) => (
          <form key={d.id} action={saveDiscount} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, alignItems: "end", padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <input type="hidden" name="id" value={d.id} />
            <Fields d={d} />
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, alignItems: "center" }}>
              <button type="submit" style={btn}>Save</button>
              <button type="submit" formAction={deleteDiscount} style={{ ...btn, color: "#C03A3A", background: "none", border: "1px solid rgba(192,58,58,0.4)" }}>Delete</button>
              <span style={{ fontFamily: MONO, fontSize: 9, color: "#6E6A60", letterSpacing: "0.08em" }}>USED {d.used_count}{d.usage_limit ? ` / ${d.usage_limit}` : ""}</span>
            </div>
          </form>
        ))}
      </div>

      <form action={addDiscount} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, alignItems: "end", marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(201,169,97,0.18)" }}>
        <div style={{ gridColumn: "1 / -1", fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.14em" }}>+ NEW CODE</div>
        <Fields />
        <div style={{ gridColumn: "1 / -1" }}><button type="submit" style={btn}>Create code</button></div>
      </form>
    </div>
  );
}
