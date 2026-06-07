// Shared controller for the auto-hiding bottom tab bar. Screens feed their scroll
// events to onScroll; the tab bar translates down on scroll-down, back up on
// scroll-up (and always shows near the top).
import { createContext, useContext, useRef } from "react";
import { Animated, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";

interface TabBarCtx {
  translateY: Animated.Value;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}
const Ctx = createContext<TabBarCtx | null>(null);

export function TabBarProvider({ height, children }: { height: number; children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const lastY = useRef(0);
  const shown = useRef(true);

  const set = (hide: boolean) => {
    if (shown.current === !hide) return;
    shown.current = !hide;
    Animated.timing(translateY, { toValue: hide ? height : 0, duration: 200, useNativeDriver: true }).start();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const dy = y - lastY.current;
    if (y < 12) set(false);
    else if (dy > 6) set(true);
    else if (dy < -6) set(false);
    lastY.current = y;
  };

  return <Ctx.Provider value={{ translateY, onScroll }}>{children}</Ctx.Provider>;
}

export function useTabBar() {
  return useContext(Ctx);
}
