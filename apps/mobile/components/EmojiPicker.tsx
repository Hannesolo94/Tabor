import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { C, F, R, SH } from "@/lib/theme";

const CATEGORIES: { name: string; emojis: string[] }[] = [
  { name: "Faith", emojis: ["🙏", "✝️", "☦️", "✡️", "☪️", "🕉️", "☮️", "🕊️", "😇", "👼", "📖", "🛐", "⛪", "🔥", "💧", "🌿"] },
  { name: "Reactions", emojis: ["🔥", "💯", "👍", "👎", "👏", "🙌", "🤝", "✊", "🤜", "🤛", "👊", "🫡", "🫶", "🤙", "👌", "✌️"] },
  { name: "Smileys", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "🙂", "😉", "😍", "🥰", "😘", "😎", "🤩", "🥳", "🤔", "🤗", "😏", "😢", "😭", "😤", "😡", "😱", "😴", "🤯", "🥺", "😬", "🙄"] },
  { name: "Hearts", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💖", "💘", "💝"] },
  { name: "Strength", emojis: ["💪", "🦾", "🏋️", "🏃", "🚴", "🤸", "🧗", "🥊", "🏆", "🥇", "🎯", "⚡", "⛰️", "🦁", "🦅", "🐂"] },
  { name: "Symbols", emojis: ["⭐", "🌟", "✨", "💫", "✅", "❌", "⚠️", "❗", "❓", "💢", "💥", "💦", "🎉", "🎊", "💎", "👑"] },
];

export function EmojiPicker({ visible, recents, onPick, onClose }: { visible: boolean; recents: string[]; onPick: (e: string) => void; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.glassBorder, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, maxHeight: "72%", ...SH.float }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 2, fontFamily: F.mono }}>REACT WITH ANY EMOJI</Text>
            <Pressable onPress={onClose} hitSlop={10}><Text style={{ color: C.muted, fontSize: 18 }}>✕</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 34 }}>
            {recents.length > 0 && <Section name="Recent" emojis={recents} onPick={onPick} />}
            {CATEGORIES.map((cat) => <Section key={cat.name} name={cat.name} emojis={cat.emojis} onPick={onPick} />)}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Section({ name, emojis, onPick }: { name: string; emojis: string[]; onPick: (e: string) => void }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginBottom: 8 }}>{name.toUpperCase()}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {emojis.map((e, i) => (
          <Pressable key={name + i} onPress={() => onPick(e)} style={{ width: "12.5%", aspectRatio: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 26 }}>{e}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
