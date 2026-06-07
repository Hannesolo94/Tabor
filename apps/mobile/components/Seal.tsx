import Svg, { Circle, Path } from "react-native-svg";
import { C, F } from "@/lib/theme";

// Simplified TABOR seal: ringed mountain + flame/cross. Placeholder until the
// full brand mark (tabor-mark.jsx) is ported to RN SVG.
export function Seal({ size = 40, color = C.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" stroke={color} strokeWidth="2.5" fill="none" />
      <Circle cx="50" cy="50" r="38" stroke={color} strokeWidth="1" fill="none" opacity={0.5} />
      {/* mountain */}
      <Path d="M22 68 L42 38 L54 54 L64 42 L78 68 Z" stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {/* flame / ascent */}
      <Path d="M50 20 C54 28 52 32 50 36 C48 32 46 28 50 20 Z" fill={color} />
    </Svg>
  );
}
