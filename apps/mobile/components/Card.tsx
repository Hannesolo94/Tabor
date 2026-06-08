import { View, type ViewStyle, type StyleProp } from "react-native";
import type { ReactNode } from "react";
import { C, R, SH } from "@/lib/theme";

/** Floating, rounded, shadowed surface with a faint gold-tinted border + top hairline.
 *  The Phase-1 "glass" look (true frosted blur comes with a native build). */
export function Card({ children, style, glow, soft, pad = 16 }: { children?: ReactNode; style?: StyleProp<ViewStyle>; glow?: boolean; soft?: boolean; pad?: number }) {
  return (
    <View style={[{ backgroundColor: soft ? C.glassSoft : C.surface2, borderWidth: 1, borderColor: C.glassBorder, borderRadius: R.lg, padding: pad }, glow ? SH.glow : SH.card, style]}>
      <View style={{ position: "absolute", top: 0, left: 14, right: 14, height: 1, backgroundColor: C.hairline, borderRadius: 1 }} />
      {children}
    </View>
  );
}
