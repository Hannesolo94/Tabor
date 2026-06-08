import { Image, Pressable, Text, Linking } from "react-native";
import type { MediaRef } from "@/lib/media";
import { C, F } from "@/lib/theme";

export function MediaBubble({ media }: { media: MediaRef }) {
  if (media.t === "video") {
    // Open in the system player (robust everywhere; no native module needed).
    return (
      <Pressable onPress={() => Linking.openURL(media.url)} style={{ width: 220, height: 140, borderRadius: 14, backgroundColor: "#000", borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: C.gold, fontSize: 32 }}>▶</Text>
        <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, marginTop: 6, letterSpacing: 1 }}>TAP TO PLAY VIDEO</Text>
      </Pressable>
    );
  }
  // images + gifs (Image animates GIFs)
  return <Image source={{ uri: media.url }} style={{ width: 220, height: 220, borderRadius: 14, backgroundColor: C.surface }} resizeMode="cover" />;
}
