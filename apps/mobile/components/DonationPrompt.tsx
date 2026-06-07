// Monthly "support the mission" prompt. Shows at most once every ~30 days, can be
// turned off. NO in-app payment (Apple/Google rules) — it links out to the web.
import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Seal } from "@/components/Seal";
import { C, F } from "@/lib/theme";

const SITE = "https://tabor.quest";
const KEY_LAST = "tabor.donate.last";
const KEY_OFF = "tabor.donate.off";
const MONTH = 30 * 86400000;

export function DonationPrompt({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    (async () => {
      const off = await AsyncStorage.getItem(KEY_OFF);
      if (off === "1") return;
      const last = Number((await AsyncStorage.getItem(KEY_LAST)) || 0);
      if (!last || Date.now() - last > MONTH) setTimeout(() => setVisible(true), 1500);
    })();
  }, [enabled]);

  async function snooze() { await AsyncStorage.setItem(KEY_LAST, String(Date.now())); setVisible(false); }
  async function turnOff() { await AsyncStorage.setItem(KEY_OFF, "1"); setVisible(false); }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={snooze}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 28 }}>
        <View style={{ backgroundColor: C.surface2, borderWidth: 1, borderColor: C.gold, borderRadius: 3, padding: 26, alignItems: "center" }}>
          <Seal size={56} />
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono, marginTop: 14 }}>[ FUEL THE FIRE ]</Text>
          <Text style={{ color: C.ivory, fontSize: 22, fontFamily: F.head, marginTop: 8, textAlign: "center" }}>Keep TABOR free</Text>
          <Text style={{ color: C.text, fontSize: 14.5, lineHeight: 22, fontFamily: F.body, textAlign: "center", marginTop: 10 }}>
            This brotherhood is free for life, brother. You keep it that way. Stand with the mission by giving, or by wearing the climb. Half of every gift goes to charities we choose together.
          </Text>
          <Pressable onPress={() => { Linking.openURL(`${SITE}/give`); snooze(); }} style={{ backgroundColor: C.gold, paddingVertical: 14, width: "100%", alignItems: "center", borderRadius: 2, marginTop: 18 }}>
            <Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>SUPPORT THE MISSION</Text>
          </Pressable>
          <Pressable onPress={() => { Linking.openURL(`${SITE}/shop`); snooze(); }} style={{ borderWidth: 1, borderColor: C.gold, paddingVertical: 13, width: "100%", alignItems: "center", borderRadius: 2, marginTop: 10 }}>
            <Text style={{ color: C.gold, fontFamily: F.headMid, letterSpacing: 1 }}>SHOP THE GEAR</Text>
          </Pressable>
          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 16 }}>
            <Pressable onPress={snooze}><Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body }}>Maybe later</Text></Pressable>
            <Pressable onPress={turnOff}><Text style={{ color: C.muted, fontSize: 12, fontFamily: F.body }}>Turn off reminders</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
