import { View, Text } from "react-native";
import Svg, { Polyline, Circle, Rect } from "react-native-svg";
import type { DayPoint } from "@/lib/fitness";
import { C, F } from "@/lib/theme";

const W = 320, H = 150, PAD = 10;

export function LineChart({ data, unit = "", color = C.gold }: { data: DayPoint[]; unit?: string; color?: string }) {
  if (data.length < 2) return <Empty />;
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const n = data.length;
  const x = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD);
  const y = (v: number) => PAD + (1 - (v - min) / range) * (H - 2 * PAD);
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Polyline points={pts} fill="none" stroke={color} strokeWidth={2} />
        {data.map((d, i) => <Circle key={i} cx={x(i)} cy={y(d.value)} r={2.5} fill={color} />)}
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={lbl}>{Math.round(min)}{unit}</Text>
        <Text style={[lbl, { color: C.gold }]}>now {Math.round(vals[vals.length - 1])}{unit}</Text>
        <Text style={lbl}>{Math.round(max)}{unit}</Text>
      </View>
    </View>
  );
}

export function BarChart({ data, unit = "" }: { data: DayPoint[]; unit?: string }) {
  if (!data.length) return <Empty />;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const n = data.length;
  const gap = (W - 2 * PAD) / n;
  const bw = gap * 0.7;
  return (
    <View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {data.map((d, i) => {
          const h = (d.value / max) * (H - 2 * PAD);
          return <Rect key={i} x={PAD + i * gap + (gap - bw) / 2} y={H - PAD - h} width={bw} height={Math.max(h, 1)} fill={C.gold} rx={1} />;
        })}
      </Svg>
      <Text style={[lbl, { textAlign: "right" }]}>peak {Math.round(max).toLocaleString()}{unit}</Text>
    </View>
  );
}

function Empty() {
  return <View style={{ height: H, alignItems: "center", justifyContent: "center" }}><Text style={{ color: C.muted, fontFamily: F.body, fontSize: 13, textAlign: "center", paddingHorizontal: 20 }}>Log a few workouts and your chart builds here.</Text></View>;
}
const lbl = { color: C.muted, fontSize: 9, fontFamily: F.mono } as const;
