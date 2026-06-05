import { getHero } from "@/lib/content-db";
import { ContentForm } from "./ContentForm";
import { AnnouncementsManager } from "./AnnouncementsManager";
import { supabaseServer } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/announcements-db";
import { GOLD, MONO, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const hero = await getHero();
  const sb = await supabaseServer();
  const { data } = await sb.from("announcements").select("*").order("sort", { ascending: true });
  const announcements = (data ?? []) as Announcement[];

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.24em", marginBottom: 6 }}>[ PAGES ]</div>
      <h1 style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 30, color: "#E8E2D5", margin: "0 0 6px" }}>Content</h1>
      <p style={{ fontFamily: BODY, fontSize: 13, color: "#9A948A", margin: "0 0 26px" }}>Edit your landing-page hero and the top announcement bar. Changes go live immediately.</p>

      <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 16, color: "#E8E2D5", marginBottom: 14 }}>Home hero</div>
      <ContentForm hero={hero} />

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(201,169,97,0.16)" }}>
        <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 16, color: "#E8E2D5", marginBottom: 4 }}>Announcement bar</div>
        <p style={{ fontFamily: BODY, fontSize: 12.5, color: "#9A948A", margin: "0 0 6px" }}>The rotating bar above the header. Add as many cycles as you like; the bar shows one at a time and rotates.</p>
        <AnnouncementsManager items={announcements} />
      </div>
    </div>
  );
}
