import { Tabs } from "expo-router";
import { Text, Animated } from "react-native";
import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TabBarProvider, useTabBar } from "@/lib/tabbar";
import { C, F } from "@/lib/theme";

function Icon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 17, color }}>{glyph}</Text>;
}

// Wraps the standard tab bar so it can slide out of view on scroll. Not absolute,
// so the scene still reserves its space (no content underlap).
function AnimatedTabBar(props: BottomTabBarProps) {
  const tb = useTabBar();
  return (
    <Animated.View style={{ transform: tb ? [{ translateY: tb.translateY }] : [] }}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <TabBarProvider height={92}>
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
