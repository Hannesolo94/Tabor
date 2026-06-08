import type { Metadata } from "next";

// Unlisted design-direction preview. Not linked anywhere, and noindex'd so it never
// shows up in search. Archive by deleting this folder when approved.
export const metadata: Metadata = {
  title: "TABOR · Design Preview",
  robots: { index: false, follow: false, nocache: true },
};

const css = `
.lab {
  min-height: 100vh;
  padding: 64px 20px 120px;
  color: #e8e2d5;
  font-family: var(--font-inter), system-ui, sans-serif;
  background:
    radial-gradient(120% 80% at 50% -10%, rgba(201,169,97,0.12), transparent 55%),
    radial-gradient(90% 70% at 110% 110%, rgba(106,61,143,0.10), transparent 60%),
    radial-gradient(70% 60% at -10% 100%, rgba(47,93,143,0.08), transparent 60%),
    #08080a;
}
.lab-wrap { max-width: 1040px; margin: 0 auto; }
.eyebrow { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.32em; color: #c9a961; text-transform: uppercase; }
.mark {
  font-family: var(--font-pirata), serif; font-size: 72px; line-height: 1; margin: 14px 0 6px;
  background: linear-gradient(135deg, #e8d08c 0%, #c9a961 38%, #8a5a2b 70%, #c9a961 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 24px rgba(201,169,97,0.25));
}
.h-cinzel { font-family: var(--font-cinzel), serif; }
.sub { color: #9a958a; font-size: 15px; max-width: 560px; }
.pill { display:inline-block; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.2em; color:#9a958a; border:1px solid rgba(201,169,97,0.3); border-radius: 999px; padding: 5px 12px; }

.grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; margin-top: 44px; }
.col-7 { grid-column: span 7; } .col-5 { grid-column: span 5; } .col-6 { grid-column: span 6; } .col-12 { grid-column: span 12; }
@media (max-width: 760px) { .col-7,.col-5,.col-6 { grid-column: span 12; } .mark { font-size: 56px; } }

/* ── the glass surface ── */
.glass {
  position: relative;
  background: linear-gradient(160deg, rgba(34,34,42,0.66), rgba(14,14,19,0.52));
  backdrop-filter: blur(26px) saturate(150%);
  -webkit-backdrop-filter: blur(26px) saturate(150%);
  border: 1px solid rgba(201,169,97,0.16);
  border-radius: 22px;
  box-shadow:
    0 28px 70px -24px rgba(0,0,0,0.85),
    0 2px 0 rgba(255,255,255,0.05) inset,
    0 -30px 60px -40px rgba(201,169,97,0.18) inset;
  padding: 24px;
}
.glass.glow { box-shadow: 0 28px 70px -24px rgba(0,0,0,0.85), 0 2px 0 rgba(255,255,255,0.06) inset, 0 0 60px -16px rgba(201,169,97,0.30); }
/* faint stained-glass sheen on the top edge */
.glass::before {
  content:""; position:absolute; inset:0; border-radius: 22px; padding:1px; pointer-events:none;
  background: linear-gradient(140deg, rgba(232,208,140,0.5), rgba(201,169,97,0.05) 30%, transparent 55%, rgba(106,61,143,0.18));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
.label { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.24em; color:#c9a961; text-transform: uppercase; }
.title { font-family: var(--font-cinzel), serif; font-weight: 700; }

/* quest progress */
.bar { height: 8px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
.bar > i { display:block; height:100%; width:62%; border-radius:999px; background: linear-gradient(90deg, #8a5a2b, #c9a961 50%, #e8d08c); box-shadow: 0 0 16px rgba(201,169,97,0.6); }

/* stat tiles */
.tiles { display:grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.tile {
  background: linear-gradient(160deg, rgba(40,40,50,0.5), rgba(16,16,22,0.4));
  border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 14px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 30px -22px rgba(0,0,0,0.9);
}
.tile b { font-family: var(--font-cinzel), serif; font-size: 26px; color:#c9a961; display:block; }

/* stained-glass seal */
.seal-wrap { display:flex; align-items:center; gap: 18px; }
.seal {
  width: 92px; height: 92px; border-radius: 50%; position: relative; flex: none;
  background: conic-gradient(from 220deg, #c9a961, #e8d08c, #b5532f, #6a3d8f, #2f5d8f, #1f7a5d, #c9a961);
  box-shadow: 0 10px 40px -8px rgba(201,169,97,0.5), 0 0 0 1px rgba(0,0,0,0.4) inset;
  display:flex; align-items:center; justify-content:center;
}
.seal::after { content:""; position:absolute; inset:7px; border-radius:50%; background: radial-gradient(circle at 38% 30%, rgba(20,18,26,0.55), rgba(8,8,12,0.92)); border:1px solid rgba(232,208,140,0.35); }
.seal span { position: relative; z-index:1; font-family: var(--font-pirata), serif; font-size: 40px; color:#e8d08c; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6)); }

/* buttons */
.btns { display:flex; gap: 12px; flex-wrap: wrap; }
.btn { border:0; cursor:pointer; border-radius: 14px; padding: 14px 26px; font-family: var(--font-cinzel), serif; font-weight:700; letter-spacing: 0.06em; font-size: 14px; }
.btn-primary { color:#1a1408; background: linear-gradient(180deg, #f0d89a, #c9a961); box-shadow: 0 10px 28px -8px rgba(201,169,97,0.55), 0 1px 0 rgba(255,255,255,0.5) inset, 0 -2px 0 rgba(120,80,30,0.4) inset; }
.btn-ghost { color:#e8d08c; background: rgba(201,169,97,0.06); border:1px solid rgba(201,169,97,0.35); }
.btn-glass { color:#e8e2d5; background: linear-gradient(160deg, rgba(40,40,50,0.6), rgba(16,16,22,0.45)); border:1px solid rgba(255,255,255,0.08); backdrop-filter: blur(14px); }

/* chat bubbles */
.bubble { max-width: 78%; padding: 12px 15px; border-radius: 18px; font-size: 14.5px; line-height: 1.5; margin-bottom: 10px; }
.bubble.them { background: linear-gradient(160deg, rgba(40,40,50,0.6), rgba(18,18,24,0.5)); border:1px solid rgba(255,255,255,0.07); border-bottom-left-radius: 5px; }
.bubble.me { background: linear-gradient(160deg, rgba(201,169,97,0.22), rgba(201,169,97,0.10)); border:1px solid rgba(201,169,97,0.3); border-bottom-right-radius: 5px; margin-left:auto; color:#f3ecdc; }

.tag { display:inline-block; font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing:0.18em; color:#0e0e12; background: linear-gradient(180deg, #e8d08c, #c9a961); padding: 4px 9px; border-radius: 6px; }
.section-h { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.3em; color:#6a665c; text-transform: uppercase; margin: 54px 0 4px; }
.note { margin-top: 80px; padding-top: 22px; border-top:1px solid rgba(255,255,255,0.06); color:#6a665c; font-size: 13px; font-family: var(--font-mono), monospace; }
`;

export default function DesignPreview() {
  return (
    <main className="lab">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="lab-wrap">
        <div className="eyebrow">[ Design Direction · Unlisted Preview ]</div>
        <div className="mark">TABOR</div>
        <p className="sub h-cinzel" style={{ fontSize: 18, color: "#e8e2d5", margin: "0 0 8px" }}>Sleeker. Floating. Stained glass.</p>
        <p className="sub">Same dark soul, same fonts. Now with glass surfaces, depth, soft shadows and cathedral-light gradients. Tell me what to push further or pull back.</p>
        <div style={{ marginTop: 16 }}><span className="pill">○ Not linked · noindex · easy to archive</span></div>

        <div className="section-h">Floating glass cards</div>
        <div className="grid">
          {/* daily quest */}
          <div className="col-7">
            <div className="glass glow">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="label">Daily Quest · Scripture Raid</span>
                <span className="tag">+40 XP</span>
              </div>
              <h3 className="title" style={{ fontSize: 24, margin: "12px 0 6px" }}>Read Psalm 23</h3>
              <p style={{ color: "#b8b2a6", fontSize: 14.5, lineHeight: 1.55, margin: "0 0 18px" }}>The Lord is my shepherd. Sit with the whole psalm, then seal the quest to keep your streak alive.</p>
              <div className="bar"><i /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "#9a958a" }}><span>4 OF 6 QUESTS SEALED</span><span style={{ color: "#c9a961" }}>62%</span></div>
            </div>
          </div>
          {/* rank / seal */}
          <div className="col-5">
            <div className="glass" style={{ height: "100%" }}>
              <span className="label">Your Ascent</span>
              <div className="seal-wrap" style={{ marginTop: 16 }}>
                <div className="seal"><span>✝</span></div>
                <div>
                  <div className="title" style={{ fontSize: 22, color: "#e8e2d5" }}>Forged</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#9a958a", letterSpacing: "0.1em", marginTop: 3 }}>LEVEL 14 · CRUSADER</div>
                </div>
              </div>
              <div className="tiles" style={{ marginTop: 20 }}>
                <div className="tile"><span className="label" style={{ fontSize: 9 }}>XP</span><b>2,480</b></div>
                <div className="tile"><span className="label" style={{ fontSize: 9 }}>Streak</span><b>23d</b></div>
                <div className="tile"><span className="label" style={{ fontSize: 9 }}>Rank</span><b>#7</b></div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-h">Buttons &amp; depth</div>
        <div className="glass" style={{ marginTop: 16 }}>
          <div className="btns">
            <button className="btn btn-primary">SEAL THE DAY</button>
            <button className="btn btn-ghost">Add to Routine</button>
            <button className="btn btn-glass">Share</button>
          </div>
        </div>

        <div className="section-h">Brotherhood · chat &amp; glass sheet</div>
        <div className="grid" style={{ marginTop: 16 }}>
          <div className="col-6">
            <div className="glass">
              <span className="label">#war-room</span>
              <div style={{ marginTop: 16 }}>
                <div className="bubble them">Pushed past 100 push-ups today. The System does not lie. 🔥</div>
                <div className="bubble me">Forged in fire, brother. Tabata at 6?</div>
                <div className="bubble them">Always. 💪</div>
              </div>
            </div>
          </div>
          {/* action sheet preview */}
          <div className="col-6">
            <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "26px 20px 22px", background: "linear-gradient(180deg, rgba(201,169,97,0.06), transparent)" }}>
                <div style={{ width: 38, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.15)", margin: "0 auto 18px" }} />
                <div style={{ textAlign: "center", fontFamily: "var(--font-cinzel)", fontWeight: 700, fontSize: 18, color: "#e8e2d5" }}>Message</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "18px 0" }}>
                  {["🔥", "🙏", "💪", "❤️", "➕"].map((e) => (
                    <div key={e} style={{ width: 50, height: 50, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: "linear-gradient(160deg, rgba(40,40,50,0.6), rgba(16,16,22,0.5))", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 18px -10px rgba(0,0,0,0.9)" }}>{e}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <div className="btn btn-glass" style={{ textAlign: "center", padding: "13px" }}>View profile</div>
                  <div className="btn btn-primary" style={{ textAlign: "center", padding: "13px" }}>SAVE TO NOTES</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="note">This is a direction, not the final pixels. Approve the vibe and I will translate it to the app: rounded corners, soft shadows and translucent surfaces work today on Expo Go and the APK. The true frosted-glass blur + gradients come with the next native build. — When you say archive, I delete this page.</p>
      </div>
    </main>
  );
}
