import { createClient } from "@supabase/supabase-js";
import { DonateForm } from "./DonateForm";
import { GOLD, MONO, PIRATA, CINZEL, BODY } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Support the Mission", description: "Keep TABOR free for every brother. Half to the charities the community chooses, half to keep the mission running. Fully transparent.", alternates: { canonical: "/give" } };

function sb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } }); }

export default async function GivePage() {
  const c = sb();
  const [goalRes, charRes, totalsRes, boardRes] = await Promise.all([
    c.from("donation_goals").select("*").eq("active", true).order("sort").limit(1).maybeSingle(),
    c.from("charities").select("id, name, blurb").eq("active", true).order("sort"),
    c.rpc("donation_totals"),
    c.rpc("donor_board"),
  ]);
  const goal = goalRes.data as { title: string; description: string; target_amount: number; charity_split_pct: number } | null;
  const charities = charRes.data ?? [];
  const totals = (totalsRes.data ?? { raised: 0, donors: 0 }) as { raised: number; donors: number };
  const board = (boardRes.data ?? []) as { name: string; amount: number; created_at: string }[];
  const pct = goal && goal.target_amount > 0 ? Math.min(100, Math.round((Number(totals.raised) / goal.target_amount) * 100)) : 0;
  const split = goal?.charity_split_pct ?? 50;

  return (
    <div style={{ background: "#0A0A0A", minHeight: "80vh" }}>
      <section style={{ padding: "64px 24px 30px", textAlign: "center", borderBottom: "1px solid rgba(201,169,97,0.12)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.24em", marginBottom: 12 }}>[ SUPPORT THE MISSION ]</div>
          <h1 style={{ fontFamily: PIRATA, fontSize: "clamp(44px,9vw,84px)", color: "#E8E2D5", margin: 0, lineHeight: 0.95 }}>Fuel the Fire</h1>
          <p style={{ fontFamily: BODY, fontSize: 16, color: "#9A948A", lineHeight: 1.6, margin: "16px auto 0", maxWidth: 560 }}>
            TABOR is free for every brother, for life. You keep it that way. Two ways to stand with us: <strong style={{ color: "#E8E2D5" }}>give below</strong>, or <strong style={{ color: "#E8E2D5" }}>wear the climb</strong> from our store. Both build the Kingdom.
          </p>
          <p style={{ fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.1em", margin: "16px auto 0", maxWidth: 520 }}>
            NO ADS. EVER. WE NEVER SELL YOUR DATA. TABOR IS FUNDED ONLY BY BROTHERS AND BY THE GEAR. A SEAMLESS, SACRED SPACE.
          </p>
        </div>
      </section>

      <section style={{ padding: "36px 24px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 30 }}>
          {/* left: transparency + goal + board */}
          <div>
            {goal && (
              <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))", borderRadius: 18, boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 50px -16px rgba(201,169,97,0.22)", padding: "22px" }}>
                <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 20, color: "#E8E2D5" }}>{goal.title}</div>
                <p style={{ fontFamily: BODY, fontSize: 13.5, color: "#9A948A", lineHeight: 1.6, marginTop: 6 }}>{goal.description}</p>
                <div style={{ height: 10, background: "#15151A", borderRadius: 5, overflow: "hidden", marginTop: 16 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,#E8D08C,${GOLD})` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: MONO, fontSize: 12, color: GOLD }}>
                  <span>R{Number(totals.raised).toLocaleString()}</span>
                  <span style={{ color: "#8A847A" }}>of R{Number(goal.target_amount).toLocaleString()} · {totals.donors} brothers</span>
                </div>
              </div>
            )}

            {/* transparency split */}
            <div style={{ border: "1px solid rgba(201,169,97,0.16)", background: "linear-gradient(160deg, rgba(34,34,42,0.72), rgba(15,15,20,0.6))", borderRadius: 18, boxShadow: "0 20px 50px -22px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)", padding: "20px", marginTop: 16 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.16em", marginBottom: 12 }}>WHERE EVERY RAND GOES</div>
              <Split label={`Charities the community chooses`} pct={split} color={GOLD} />
              <Split label="Keeping TABOR free + running" pct={100 - split} color="#6fa8dc" />
              <p style={{ fontFamily: BODY, fontSize: 12, color: "#8A847A", lineHeight: 1.6, marginTop: 10 }}>
                Full transparency: {split}% of every gift goes to the charities our brotherhood votes for. The remaining {100 - split}% keeps the app free, the servers running, and the mission alive. The business portion is not a tax-deductible donation.
              </p>
            </div>

            {/* donor wall */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD, letterSpacing: "0.16em", marginBottom: 10 }}>THE DONOR WALL</div>
              {board.length === 0 ? (
                <p style={{ fontFamily: BODY, fontSize: 13, color: "#8A847A" }}>Be the first name on the wall.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {board.map((d, i) => (
                    <span key={i} style={{ fontFamily: MONO, fontSize: 11, color: "#C3BDB1", border: `1px solid ${GOLD}33`, borderRadius: 8, background: "rgba(201,169,97,0.05)", padding: "6px 10px" }}>{d.name} · R{Number(d.amount).toLocaleString()}</span>
                  ))}
                </div>
              )}
              <p style={{ fontFamily: MONO, fontSize: 9, color: "#8A847A", letterSpacing: "0.06em", marginTop: 8 }}>EVERY DONOR JOINS THE WALL + ENTERS OUR FREE GIVEAWAY DRAWS.</p>
            </div>
          </div>

          {/* right: form */}
          <div>
            <div style={{ fontFamily: CINZEL, fontWeight: 700, fontSize: 18, color: "#E8E2D5", marginBottom: 14 }}>Give</div>
            <DonateForm charities={charities} goalId={goalRes.data?.id ?? null} />
            <a href="/shop" style={{ display: "block", textAlign: "center", marginTop: 16, fontFamily: MONO, fontSize: 11, color: GOLD, letterSpacing: "0.1em", textDecoration: "none" }}>OR SUPPORT BY WEARING THE CLIMB → SHOP</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Split({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontSize: 13, color: "#C3BDB1", marginBottom: 4 }}><span>{label}</span><span style={{ color, fontFamily: MONO }}>{pct}%</span></div>
      <div style={{ height: 6, background: "#15151A", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: color }} /></div>
    </div>
  );
}
