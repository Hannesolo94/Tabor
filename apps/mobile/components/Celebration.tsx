import { useEffect, useRef, useState, type ReactNode } from "react";
import { View, Text, Pressable, Modal, Animated, Easing, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Seal } from "./Seal";
import { C, F } from "@/lib/theme";

const PARTICLES = 16;

/** Reusable completion celebration: seal burst + glow + XP count-up. Optional `children`
 *  slot (e.g. the workout time/calorie capture) renders above the Continue button. */
export function Celebration({ visible, xp, title, message, children, doneLabel = "Continue", onDone }: {
  visible: boolean; xp?: number; title: string; message?: string; children?: ReactNode; doneLabel?: string; onDone: () => void;
}) {
  const sealScale = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const [xpShown, setXpShown] = useState(0);

  useEffect(() => {
    if (!visible) return;
    sealScale.setValue(0); glow.setValue(0.3); burst.setValue(0); setXpShown(0);
    Animated.spring(sealScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.35, duration: 1100, useNativeDriver: true }),
    ])).start();
    Animated.timing(burst, { toValue: 1, duration: 750, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    if (xp) {
      const v = new Animated.Value(0);
      const id = v.addListener(({ value }) => setXpShown(Math.round(value)));
      Animated.timing(v, { toValue: xp, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: false }).start(() => v.removeListener(id));
    }
  }, [visible, xp]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone} statusBarTranslucent>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.6)" }]} />

        <View style={{ alignItems: "center", justifyContent: "center", height: 150 }}>
          {Array.from({ length: PARTICLES }).map((_, i) => {
            const angle = (i / PARTICLES) * Math.PI * 2;
            const tx = burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * (70 + (i % 3) * 18)] });
            const ty = burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * (70 + (i % 3) * 18)] });
            const op = burst.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 1, 0] });
            return <Animated.View key={i} style={{ position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold, opacity: op, transform: [{ translateX: tx }, { translateY: ty }] }} />;
          })}
          <Animated.View style={{ opacity: glow, position: "absolute", width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(201,169,97,0.22)" }} />
          <Animated.View style={{ transform: [{ scale: sealScale }] }}><Seal size={94} /></Animated.View>
        </View>

        <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 5, fontFamily: F.mono, marginTop: 14, textAlign: "center" }}>{title}</Text>
        {xp ? <Text style={{ color: C.ivory, fontSize: 42, fontFamily: F.head, marginTop: 8 }}>+{xpShown} <Text style={{ fontSize: 18, color: C.gold }}>XP</Text></Text> : null}
        {message ? <Text style={{ color: C.muted, fontSize: 14, fontFamily: F.body, textAlign: "center", marginTop: 10, lineHeight: 20, maxWidth: 320 }}>{message}</Text> : null}
        {children ? <View style={{ width: "100%", maxWidth: 360, marginTop: 18 }}>{children}</View> : null}

        <Pressable onPress={onDone} style={{ marginTop: 22, backgroundColor: C.gold, paddingVertical: 14, paddingHorizontal: 44, borderRadius: 14 }}>
          <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>{doneLabel.toUpperCase()}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
