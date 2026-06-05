// proto-main.jsx — standalone mount, scales the device to fit the viewport (no page scroll)
const { useState: useMS, useEffect: useME } = React;
function Root() {
  const [scale, setScale] = useMS(1);
  useME(() => {
    const fit = () => {
      const margin = 20;
      const sh = (window.innerHeight - margin) / 874;
      const sw = (window.innerWidth - margin) / 402;
      setScale(Math.min(1, sh, sw));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "radial-gradient(ellipse 80% 60% at 50% 0%, #1a1a1f, #0a0a0a 70%)", display: "grid", placeItems: "center" }}>
      <button onClick={() => { try { localStorage.removeItem("tabor_proto_v3"); } catch (e) {} location.reload(); }}
        style={{ position: "fixed", top: 14, right: 14, zIndex: 100, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#C9A961", background: "rgba(20,20,26,0.85)", border: "1px solid rgba(201,169,97,0.4)", padding: "8px 12px", cursor: "pointer" }}>↻ RESET TO ONBOARDING</button>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}><App /></div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
