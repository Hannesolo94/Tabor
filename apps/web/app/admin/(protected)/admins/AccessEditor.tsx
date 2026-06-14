"use client";

// Owner-only: set a staff member's role + scoped access areas (Discord-style).
import { useState } from "react";
import { setStaffAccess } from "./actions";
import { AREAS } from "@/lib/access";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const btnGold: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1408", fontWeight: 700, background: "linear-gradient(180deg, #f0d89a, #c9a961)", boxShadow: "0 6px 18px -6px rgba(201,169,97,0.45), inset 0 1px 0 rgba(255,255,255,0.4)", border: "none", borderRadius: 12, padding: "11px 20px", cursor: "pointer" };

export function AccessEditor({ userId, role: initialRole, access }: { userId: string; role: string; access: string[] }) {
  const [role, setRole] = useState(initialRole === "admin" ? "admin" : "moderator");
  const isAdmin = role === "admin";

  return (
    <form action={setStaffAccess} className="admin-card" style={cardStyle}>
      <input type="hidden" name="user_id" value={userId} />
      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 }}>Role &amp; access</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {([["admin", "Admin", "Full access to everything (except owner-only actions)"], ["moderator", "Custom", "Only the areas you choose below"]] as const).map(([val, label, desc]) => (
          <button key={val} type="button" onClick={() => setRole(val)} style={{ flex: 1, textAlign: "left", padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: `1px solid ${role === val ? GOLD : "rgba(201,169,97,0.2)"}`, background: role === val ? "rgba(201,169,97,0.12)" : "transparent" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", color: role === val ? GOLD : "#C3BDB1", fontWeight: 700 }}>{role === val ? "● " : ""}{label}</div>
            <div style={{ fontFamily: BODY, fontSize: 11, color: "#8A847A", marginTop: 3 }}>{desc}</div>
          </button>
        ))}
      </div>
      <input type="hidden" name="role" value={role} />

      <div style={{ opacity: isAdmin ? 0.4 : 1, pointerEvents: isAdmin ? "none" : "auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 8 }}>Access areas</div>
        <div style={{ display: "grid", gap: 8 }}>
          {AREAS.map((a) => {
            const on = access.includes(a.key);
            return (
              <label key={a.key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 13px", border: "1px solid rgba(201,169,97,0.16)", borderRadius: 12, cursor: "pointer" }}>
                <input type="checkbox" name={`area_${a.key}`} defaultChecked={on} disabled={isAdmin} style={{ marginTop: 3 }} />
                <span>
                  <span style={{ fontFamily: BODY, fontSize: 13.5, color: "#E8E2D5", fontWeight: 600 }}>{a.label}</span>
                  <span style={{ display: "block", fontFamily: BODY, fontSize: 11.5, color: "#8A847A", marginTop: 2 }}>{a.desc}</span>
                </span>
              </label>
            );
          })}
        </div>
        {isAdmin && <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#8A847A", letterSpacing: "0.04em", marginTop: 8 }}>ADMINS HAVE ALL AREAS. SWITCH TO CUSTOM TO SCOPE ACCESS.</div>}
      </div>

      <div style={{ marginTop: 16 }}><button type="submit" style={btnGold}>Save access</button></div>
    </form>
  );
}
