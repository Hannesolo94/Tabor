import { Image } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import type { MediaRef } from "@/lib/media";
import { C } from "@/lib/theme";

export function MediaBubble({ media }: { media: MediaRef }) {
  if (media.t === "video") return <VideoBlock url={media.url} />;
  // images + gifs (Image animates GIFs)
  return <Image source={{ uri: media.url }} style={{ width: 220, height: 220, borderRadius: 4, backgroundColor: C.surface }} resizeMode="cover" />;
}

function VideoBlock({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => { p.loop = false; });
  return <VideoView player={player} style={{ width: 240, height: 180, borderRadius: 4, backgroundColor: "#000" }} nativeControls contentFit="contain" />;
}
