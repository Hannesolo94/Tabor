import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, FlatList, ActivityIndicator, Modal } from "react-native";
import { searchGifs, type Gif } from "@/lib/media";
import { C, F } from "@/lib/theme";

export function GifPicker({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (url: string) => void }) {
  const [q, setQ] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);

  async function run(query: string) { setLoading(true); setGifs(await searchGifs(query)); setLoading(false); }
  useEffect(() => { if (visible) { setQ(""); run(""); } }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.black, paddingTop: 50 }}>
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingBottom: 8, alignItems: "center" }}>
          <TextInput value={q} onChangeText={setQ} onSubmitEditing={() => run(q)} placeholder="Search GIFs…" placeholderTextColor={C.muted} autoFocus style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, fontFamily: F.body }} />
          <Pressable onPress={() => run(q)} style={{ backgroundColor: C.gold, paddingHorizontal: 14, justifyContent: "center", borderRadius: 12, paddingVertical: 10 }}><Text style={{ color: C.black, fontFamily: F.head }}>GO</Text></Pressable>
          <Pressable onPress={onClose} hitSlop={8}><Text style={{ color: C.muted, fontFamily: F.body, padding: 6 }}>Close</Text></Pressable>
        </View>
        {loading ? <ActivityIndicator color={C.gold} style={{ marginTop: 30 }} /> : (
          <FlatList
            data={gifs}
            keyExtractor={(g) => g.id}
            numColumns={2}
            contentContainerStyle={{ padding: 6 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={{ color: C.muted, textAlign: "center", marginTop: 30, fontFamily: F.body }}>No GIFs. Try another search.</Text>}
            renderItem={({ item }) => (
              <Pressable onPress={() => { onPick(item.url); onClose(); }} style={{ flex: 1, margin: 4 }}>
                <Image source={{ uri: item.preview }} style={{ width: "100%", height: 120, borderRadius: 14, backgroundColor: C.surface }} resizeMode="cover" />
              </Pressable>
            )}
          />
        )}
        <Text style={{ color: C.muted, fontSize: 9, textAlign: "center", paddingVertical: 6, letterSpacing: 2, fontFamily: F.mono }}>POWERED BY GIPHY</Text>
      </View>
    </Modal>
  );
}
