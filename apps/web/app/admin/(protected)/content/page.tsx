import { getHero } from "@/lib/content-db";
import { ContentForm } from "./ContentForm";
import { AnnouncementsManager } from "./AnnouncementsManager";
import { supabaseServer } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/announcements-db";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

const cardStyle: React.CSSProperties = { background: "linear-gradient(160deg, rgba(32,32,40,0.7), rgba(15,15,20,0.6))", border: "1px solid rgba(201,169,97,0.14)", borderRadius: 16, boxShadow: "0 18px 44px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)", padding: "18px 20px" };
const cardTitle: React.CSSProperties = { fontFamily: CINZEL, fontWeight: 700, fontSize: 14, color: "#E8E2D5", marginBottom: 14 };

export default async function ContentPage() {
  const hero = await getHero();
  const sb = await supabaseServer();
  const { data } = await sb.from("announcements").select("*").order("sort", { ascending: true });
  const announcements = (data ?? []) as Announcement[];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ PAGES ]</div>
        <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: 0 }}>Content</h1>
        <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "6px 0 0" }}>Edit your landing-page hero and the top announcement bar. Changes go live immediately.</p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <div className="admin-card" style={cardStyle}>
          <div style={cardTitle}>Home hero</div>
          <ContentForm hero={hero} />
        </div>

        <div className="admin-card" style={cardStyle}>
          <div style={{ ...cardTitle, marginBottom: 4 }}>Announcement bar</div>
          <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 6px" }}>The rotating bar above the header. Add as many cycles as you like; the bar shows one at a time and rotates.</p>
          <AnnouncementsManager items={announcements} />
        </div>
      </div>
    </div>
  );
}
