import { Tabs } from "expo-router";
import { Text } from "react-native";
import { C } from "@/lib/theme";

// Tab icons are simple glyphs for the draft; swap for the brand iconography later.
function Icon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 18, color }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: C.surface2, borderTopColor: C.line, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarActiveTintColor: C.gold,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 9, letterSpacing: 1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "QUESTS", tabBarIcon: ({ color }) => <Icon glyph="✶" color={color} /> }} />
      <Tabs.Screen name="word" options={{ title: "WORD", tabBarIcon: ({ color }) => <Icon glyph="✝" color={color} /> }} />
      <Tabs.Screen name="body" options={{ title: "BODY", tabBarIcon: ({ color }) => <Icon glyph="⚔" color={color} /> }} />
      <Tabs.Screen name="guild" options={{ title: "GUILD", tabBarIcon: ({ color }) => <Icon glyph="⛨" color={color} /> }} />
      <Tabs.Screen name="status" options={{ title: "STATUS", tabBarIcon: ({ color }) => <Icon glyph="◈" color={color} /> }} />
    </Tabs>
  );
}
