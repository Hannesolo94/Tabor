// proto-app.jsx — TABOR prototype root (frame, routing, ceremony)
const { useState: useAS, useEffect: useAE, useRef: useAR } = React;

function DaySealed({ streak, onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(20,18,12,0.96), rgba(10,10,10,0.98))", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 28px" }}>
      <style>{`@keyframes ds-flash{0%{opacity:0}14%{opacity:.55}100%{opacity:0}}@keyframes ds-seal{0%{opacity:0;transform:scale(.55);filter:blur(9px)}100%{opacity:1;transform:none;filter:none}}@keyframes ds-t{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%, rgba(244,226,172,0.5), transparent 55%)", animation: "ds-flash 1.8s ease-out both", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", position: "relative" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--holy-gold)", letterSpacing: "0.26em", animation: "ds-t .6s ease both" }}>[ QUEST COMPLETE ]</div>
        <div style={{ animation: "ds-seal 1.3s cubic-bezier(.2,.9,.2,1) .2s both", display: "flex", justifyContent: "center", margin: "20px 0 8px" }}><TaborIconSeal id="ds-seal" size={160} /></div>
        <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 22, color: "var(--holy-ivory)", letterSpacing: "0.18em", animation: "ds-t .8s ease .9s both" }}>DAY {streak} SEALED</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#B8B2A6", maxWidth: 280, margin: "12px auto 0", lineHeight: 1.55, animation: "ds-t .8s ease 1.2s both" }}>{SYSTEM.allDone}</p>
      </div>
      <div style={{ position: "absolute", left: 28, right: 28, bottom: 50, animation: "ds-t .8s ease 1.5s both" }}>
        <GoldBtn onClick={onClose}>Rest, Son of Fire</GoldBtn>
      </div>
    </div>
  );
}

const TABSET = ["quests", "scripture", "body", "guild", "store", "status"];
function App({ initialTab, persist = true, seed }) {
  const T = useTabor({ persist, seed });
  const { s, actions, level, rankIdx, rankName, nextRank, rankProgress, allDone } = T;
  const __hash = (typeof location !== "undefined" ? location.hash.replace("#", "") : "");
  const __valid = TABSET.includes(__hash) || !!initialTab;
  const startTab = (initialTab && TABSET.includes(initialTab)) ? initialTab : (TABSET.includes(__hash) ? __hash : "quests");
  const [tab, setTabRaw] = useAS(startTab);
  const [ceremony, setCeremony] = useAS(false);
  const [rankCeremony, setRankCeremony] = useAS(false);
  const [tabHidden, setTabHidden] = useAS(false);
  const prevAll = useAR(allDone);
  const prevRank = useAR(rankIdx);
  const lastTop = useAR(0);

  const setTab = (t) => { setTabRaw(t); setTabHidden(false); lastTop.current = 0; };
  const onScroll = (top) => {
    const d = top - lastTop.current;
    if (Math.abs(d) > 8) { setTabHidden(d > 0 && top > 48); lastTop.current = top; }
  };

  useAE(() => {
    if (allDone && !prevAll.current) setCeremony(true);
    prevAll.current = allDone;
  }, [allDone]);

  useAE(() => {
    if (rankIdx > prevRank.current) setRankCeremony(true);
    prevRank.current = rankIdx;
  }, [rankIdx]);

  if (!s.onboarded && !__valid) {
    return <IOSDevice dark><Awakening onFinish={actions.finishOnboarding} /></IOSDevice>;
  }

  const common = { s, actions, level, rankIdx, rankName, nextRank, rankProgress, allDone, go: setTab };
  const screen = {
    quests: <QuestsScreen {...common} />,
    scripture: <ScriptureScreen {...common} />,
    body: <BodyScreen {...common} />,
    guild: <GuildScreen {...common} />,
    store: <StoreScreen {...common} />,
    status: <StatusScreen {...common} />,
  }[tab];

  return (
    <IOSDevice dark>
      <ScrollCtx.Provider value={onScroll}>
        <div style={{ height: "100%", position: "relative" }}>
          {screen}
          <TabBar active={tab} onChange={setTab} hidden={tabHidden} />
          {ceremony && <DaySealed streak={s.streak} onClose={() => setCeremony(false)} />}
          {rankCeremony && <RankUp rank={rankName} name={s.name || "Hannes"} onClose={() => setRankCeremony(false)} />}
        </div>
      </ScrollCtx.Provider>
    </IOSDevice>
  );
}

Object.assign(window, { App, DaySealed });
