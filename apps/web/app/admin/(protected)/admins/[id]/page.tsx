// Staff member detail: profile overview + (owner only) role & scoped access editor.
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin, isCallerOwner } from "@/lib/admin-guard";
import { AREAS } from "@/lib/access";
import { revokeAdmin } from "../actions";
import { AccessEditor } from "../AccessEditor";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—");

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 8.5, color: "#8A847A", letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: BODY, fontSize: 14, color: "#E8E2D5" }}>{value}</div>
    </div>
  );
}

export default async function StaffMember({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const owner = await isCallerOwner();
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const admin = supabaseAdmin();

  const { data: p } = await admin.from("profiles")
    .select("user_id, email, name, role, is_owner, access, created_at, last_active, xp, streak, best_streak, cls, denomination, banned, onboarded")
    .eq("user_id", id).maybeSingle();
  if (!p) notFound();

  const { count: orders } = p.email
    ? await admin.from("orders").select("id", { count: "exact", head: true }).eq("email", p.email)
    : { count: 0 };

  const isSelf = p.user_id === user?.id;
  const access = (p.access as string[] | null) ?? [];
  const roleLabel = p.is_owner ? "OWNER" : p.role === "admin" ? "ADMIN" : "CUSTOM";
  const roleColor = p.is_owner || p.role === "admin" ? GOLD : "#C3BDB1";
  const areaLabels = p.role === "admin" || p.is_owner ? ["Everything"] : AREAS.filter((a) => access.includes(a.key)).map((a) => a.label);

  return (
    <div>
      <Link href="/admin/admins" style={{ fontFamily: MONO, fontSize: 10, color: "#8A847A", letterSpacing: "0.12em", textDecoration: "none" }}>← STAFF</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0 20px" }}>
        <div style={{ width: 52, height: 52, borderRadius: 26, background: "rgba(201,169,97,0.12)", border: `1px solid ${GOLD}55`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: CINZEL, fontWeight: 700, fontSize: 22, color: GOLD }}>{(p.name || p.email || "?")[0].toUpperCase()}</div>
        <div>
          <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 26, color: "#E8E2D5", margin: 0 }}>{p.name || p.email}</h1>
          <span style={{ fontFamily: MONO, fontSize: 9, color: roleColor, letterSpacing: "0.1em", border: `1px solid ${roleColor}55`, borderRadius: 8, padding: "2px 7px" }}>{roleLabel}</span>
          {isSelf && <span style={{ fontFamily: MONO, fontSize: 9, color: GOLD, letterSpacing: "0.1em" }}> · YOU</span>}
        </div>
      </div>

      <div style={{ display: "grid", gap: 18, maxWidth: 720 }}>
        <div className="admin-card" style={cardStyle}>
          <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 }}>Profile</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Email" value={p.email || "—"} />
            <Field label="Access" value={areaLabels.join(", ") || "Dashboard only"} />
            <Field label="Joined" value={fmtDate(p.created_at)} />
            <Field label="Last active" value={fmtDate(p.last_active)} />
            <Field label="Onboarded app" value={p.onboarded ? "Yes" : "No"} />
            <Field label="Orders" value={orders ?? 0} />
            <Field label="XP / Level" value={`${Number(p.xp ?? 0)}`} />
            <Field label="Streak" value={`${Number(p.streak ?? 0)}d (best ${Number(p.best_streak ?? 0)}d)`} />
            {p.cls ? <Field label="Class" value={String(p.cls)} /> : null}
            {p.denomination ? <Field label="Tradition" value={String(p.denomination)} /> : null}
            {p.banned ? <Field label="Status" value={<span style={{ color: "#C03A3A" }}>Banned</span>} /> : null}
          </div>
        </div>

        {owner && !p.is_owner ? (
          <>
            <AccessEditor userId={p.user_id} role={p.role ?? "moderator"} access={access} />
            {!isSelf && (
              <form action={revokeAdmin} style={{ paddingTop: 4 }}>
                <input type="hidden" name="user_id" value={p.user_id} />
                <button type="submit" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C03A3A", background: "rgba(192,58,58,0.06)", border: "1px solid rgba(192,58,58,0.4)", borderRadius: 12, padding: "10px 16px", cursor: "pointer" }}>Remove staff access</button>
              </form>
            )}
          </>
        ) : (
          <div className="admin-card" style={cardStyle}>
            <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: 0 }}>{p.is_owner ? "The owner has full, protected access and cannot be changed here." : <>Only the <strong style={{ color: GOLD }}>owner</strong> can change roles and access.</>}</p>
          </div>
        )}
      </div>
    </div>
  );
}
