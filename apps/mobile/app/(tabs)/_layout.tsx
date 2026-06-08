import { Tabs } from "expo-router";
import { Text, Animated, View } from "react-native";
import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TabBarProvider, useTabBar } from "@/lib/tabbar";
import { useProfile } from "@/lib/useProfile";
import { levelProgress } from "@/lib/game";
import { C, F } from "@/lib/theme";

function Icon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 17, color }}>{glyph}</Text>;
}

// Persistent rank + XP bar sitting just above the tab bar on every screen.
function XpBar() {
  const { profile } = useProfile();
  const prog = levelProgress(Number(profile?.xp ?? 0));
  return (
    <View style={{ backgroundColor: C.surface2, paddingHorizontal: 14, paddingTop: 6, paddingBottom: 3, borderTopWidth: 1, borderTopColor: C.line }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
        <Text style={{ color: C.gold, fontSize: 8.5, fontFamily: F.mono, letterSpacing: 1 }}>{prog.rank.toUpperCase()} · LVL {prog.level}</Text>
        <Text style={{ color: C.muted, fontSize: 8.5, fontFamily: F.mono }}>{prog.into} / {prog.need} XP</Text>
      </View>
      <View style={{ height: 4, backgroundColor: C.surface, borderRadius: 2, overflow: "hidden" }}>
        <View style={{ width: `${Math.round(prog.pct * 100)}%`, height: "100%", backgroundColor: C.gold }} />
      </View>
    </View>
  );
}

// Wraps the standard tab bar so it can slide out of view on scroll. Not absolute,
// so the scene still reserves its space (no content underlap).
function AnimatedTabBar(props: BottomTabBarProps) {
  const tb = useTabBar();
  return (
    <Animated.View style={{ transform: tb ? [{ translateY: tb.translateY }] : [] }}>
      <XpBar />
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <TabBarProvider height={122}>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: C.surface2, borderTopColor: C.line, height: 60, paddingBottom: 8, paddingTop: 6 },
          tabBarActiveTintColor: C.gold,
          tabBarInactiveTintColor: C.muted,
          tabBarLabelStyle: { fontSize: 9, letterSpacing: 1, fontFamily: F.mono },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "QUESTS", tabBarIcon: ({ color }) => <Icon glyph="✶" color={color} /> }} />
        <Tabs.Screen name="word" options={{ title: "WORD", tabBarIcon: ({ color }) => <Icon glyph="✝" color={color} /> }} />
        <Tabs.Screen name="body" options={{ title: "BODY", tabBarIcon: ({ color }) => <Icon glyph="⚔" color={color} /> }} />
        <Tabs.Screen name="guild" options={{ title: "GUILD", tabBarIcon: ({ color }) => <Icon glyph="⛨" color={color} /> }} />
        <Tabs.Screen name="store" options={{ title: "GEAR", tabBarIcon: ({ color }) => <Icon glyph="❖" color={color} /> }} />
        <Tabs.Screen name="status" options={{ title: "STATUS", tabBarIcon: ({ color }) => <Icon glyph="◈" color={color} /> }} />
      </Tabs>
    </TabBarProvider>
  );
}
