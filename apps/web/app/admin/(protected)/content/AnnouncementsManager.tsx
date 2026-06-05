// Announcement-bar manager (server-rendered forms). Add unlimited cycles; edit
// text, colors, font, background image, order, on/off.
import { addAnnouncement, deleteAnnouncement, saveAnnouncement } from "./announcement-actions";
import type { Announcement } from "@/lib/announcements-db";
import { GOLD, MONO, BODY } from "@/lib/ui";

const lbl: React.CSSProperties = { fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4, display: "block" };
const inp: React.CSSProperties = { fontFamily: BODY, fontSize: 12, color: "#E8E2D5", background: "#15151A", border: `1px solid ${GOLD}33`, padding: "8px 10px", width: "100%" };
const btn: React.CSSProperties = { fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0A0A0A", background: `linear-gradient(180deg,#E8D08C,${GOLD})`, border: "none", padding: "9px 14px", cursor: "pointer" };

const FONTS = [["mono", "Mono (HUD)"], ["cinzel", "Cinzel"], ["inter", "Inter"], ["pirata", "Blackletter"], ["cormorant", "Scripture"]] as const;

function Fields({ a }: { a?: Announcement }) {
  return (
    <>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={lbl}>Text</label>
        <input name="text" defaultValue={a?.text ?? ""} placeholder="FREE SHIPPING THIS WEEK" style={inp} />
      </div>
      <div><label style={lbl}>Link (optional)</label><input name="link" defaultValue={a?.link ?? ""} placeholder="/shop" style={inp} /></div>
      <div><label style={lbl}>Font</label><select name="font" defaultValue={a?.font ?? "mono"} style={inp}>{FONTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div><label style={lbl}>Background color</label><input name="bg_color" type="color" defaultValue={a?.bg_color ?? "#0C0C10"} style={{ ...inp, padding: 4, height: 36 }} /></div>
      <div><label style={lbl}>Text color</label><input name="text_color" type="color" defaultValue={a?.text_color ?? "#C9A961"} style={{ ...inp, padding: 4, height: 36 }} /></div>
      <div style={{ gridColumn: "1 / -1" }}><label style={lbl}>Background image URL (optional)</label><input name="bg_image_url" defaultValue={a?.bg_image_url ?? ""} placeholder="https://..." style={inp} /></div>
      <div><label style={lbl}>Order</label><input name="sort" type="number" defaultValue={a?.sort ?? 0} style={inp} /></div>
      <label style={{ fontFamily: MONO, fontSize: 10, color: "#C3BDB1", display: "flex", gap: 6, alignItems: "center", paddingTop: 18 }}>
        <input type="checkbox" name="enabled" defaultChecked={a ? a.enabled : true} /> Enabled
      </label>
    </>
  );
}

export function AnnouncementsManager({ items }: { items: Announcement[] }) {
  return (
    <div>
      {items.map((a) => (
        <form key={a.id} action={saveAnnouncement} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, alignItems: "end", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <input type="hidden" name="id" value={a.id} />
          <Fields a={a} />
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
            <button type="submit" style={btn}>Save</button>
            <button type="submit" formAction={deleteAnnouncement} style={{ ...btn, color: "#C03A3A", background: "none", border: "1px solid rgba(192,58,58,0.4)" }}>Delete</button>
          </div>
        </form>
      ))}

      <form action={addAnnouncement} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, alignItems: "end", marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(201,169,97,0.18)" }}>
        <div style={{ gridColumn: "1 / -1", fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.14em" }}>+ ADD A CYCLE</div>
        <Fields />
        <div style={{ gridColumn: "1 / -1" }}><button type="submit" style={btn}>Add cycle</button></div>
      </form>
    </div>
  );
}
