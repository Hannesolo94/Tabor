// Lightweight brand-styled charts (pure SVG, server-rendered, no dependency).
import { GOLD, MONO } from "@/lib/ui";

export function LineChart({ labels, values, height = 140, format = (n: number) => String(n) }: { labels: string[]; values: number[]; height?: number; format?: (n: number) => string }) {
  const w = 600;
  const pad = 8;
  const max = Math.max(1, ...values);
  const n = values.length;
  const x = (i: number) => (n <= 1 ? w / 2 : pad + (i * (w - pad * 2)) / (n - 1));
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${pad},${height - pad} ${pts} ${w - pad},${height - pad}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, color: "#8A847A", marginBottom: 4 }}>
        <span>{format(max)}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
        <polygon points={area} fill="rgba(201,169,97,0.08)" />
        <polyline points={pts} fill="none" stroke={GOLD} strokeWidth="2" />
        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill={GOLD} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 8, color: "#8A847A", marginTop: 4 }}>
        <span>{labels[0]?.slice(5)}</span>
        <span>{labels[labels.length - 1]?.slice(5)}</span>
      </div>
    </div>
  );
}

export function BarList({ items, format = (n: number) => String(n) }: { items: { label: string; value: number; sub?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p style={{ fontFamily: MONO, fontSize: 11, color: "#7A746A" }}>No data yet.</p>;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.map((it, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10.5, color: "#C3BDB1", marginBottom: 3 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{it.label}</span>
            <span style={{ color: GOLD }}>{format(it.value)}{it.sub ? <span style={{ color: "#8A847A" }}> · {it.sub}</span> : null}</span>
          </div>
          <div style={{ height: 6, background: "#15151A", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(it.value / max) * 100}%`, background: `linear-gradient(90deg, #A8843E, ${GOLD})` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {steps.map((s, i) => {
        const pctOfTop = (s.value / top) * 100;
        const conv = i === 0 ? 100 : steps[i - 1]!.value ? (s.value / steps[i - 1]!.value) * 100 : 0;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10.5, color: "#C3BDB1", marginBottom: 3 }}>
              <span>{s.label}</span>
              <span style={{ color: GOLD }}>{s.value}{i > 0 && <span style={{ color: "#8A847A" }}> · {conv.toFixed(0)}%</span>}</span>
            </div>
            <div style={{ height: 14, background: "#15151A" }}>
              <div style={{ height: "100%", width: `${Math.max(2, pctOfTop)}%`, background: `linear-gradient(90deg, #A8843E, ${GOLD})` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
