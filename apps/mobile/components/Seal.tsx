import Svg, { Circle, Path, Defs, LinearGradient, Stop, RadialGradient } from "react-native-svg";
import { C } from "@/lib/theme";

// TABOR seal: ringed mountain + flame/cross, finished with a stained-glass gradient
// (gold -> amber -> ember) and a faint radial glow.
export function Seal({ size = 40, color = C.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="seal-glass" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#e8d08c" />
          <Stop offset="0.42" stopColor="#c9a961" />
          <Stop offset="0.72" stopColor="#b5532f" />
          <Stop offset="1" stopColor="#8a5a2b" />
        </LinearGradient>
        <RadialGradient id="seal-glow" cx="0.4" cy="0.34" r="0.72">
          <Stop offset="0" stopColor="rgba(201,169,97,0.20)" />
          <Stop offset="1" stopColor="rgba(8,8,12,0)" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="50" r="46" fill="url(#seal-glow)" />
      <Circle cx="50" cy="50" r="46" stroke="url(#seal-glass)" strokeWidth="2.5" fill="none" />
      <Circle cx="50" cy="50" r="38" stroke={color} strokeWidth="1" fill="none" opacity={0.45} />
      {/* mountain */}
      <Path d="M22 68 L42 38 L54 54 L64 42 L78 68 Z" stroke="url(#seal-glass)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {/* flame / ascent */}
      <Path d="M50 20 C54 28 52 32 50 36 C48 32 46 28 50 20 Z" fill="url(#seal-glass)" />
    </Svg>
  );
}
