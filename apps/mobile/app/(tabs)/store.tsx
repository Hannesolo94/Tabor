import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, Linking, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { C, F } from "@/lib/theme";
import { useTabBar } from "@/lib/tabbar";

const SITE = "https://tabor.quest";
interface Product { sku: string; name: string; base_price: number | null; image_url: string | null; collection: string | null }

export default function Store() {
  const tb = useTabBar();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const w = (Dimensions.get("window").width - 22 * 2 - 14) / 2;

  useEffect(() => {
    supabase.from("products").select("sku, name, base_price, image_url, collection").eq("status", "live").order("sort", { ascending: true }).then(({ data }) => {
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }} edges={["top"]}>
      <ScrollView onScroll={tb?.onScroll} scrollEventThrottle={16} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
        <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 4, fontFamily: F.mono }}>[ THE ARMOURY ]</Text>
        <Text style={{ color: C.ivory, fontSize: 28, fontWeight: "800", fontFamily: F.head, marginTop: 6 }}>Gear</Text>
        <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, lineHeight: 19 }}>Wear the climb. Tap any piece to view and buy on tabor.quest.</Text>

        <Pressable onPress={() => Linking.openURL(`${SITE}/shop`)} style={{ borderWidth: 1, borderColor: C.gold, paddingVertical: 13, alignItems: "center", borderRadius: 2, marginTop: 16, marginBottom: 20 }}>
          <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 2, fontWeight: "700" }}>SHOP ALL ON WEB ↗</Text>
        </Pressable>

        {loading ? <ActivityIndicator color={C.gold} style={{ marginTop: 30 }} /> : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
            {products.length === 0 && <Text style={{ color: C.muted, fontSize: 14 }}>No gear live yet. Check back soon.</Text>}
            {products.map((p) => (
              <Pressable key={p.sku} onPress={() => Linking.openURL(`${SITE}/product/${p.sku}`)} style={{ width: w }}>
                <View style={{ width: w, height: w, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 2, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
                  {p.image_url ? <Image source={{ uri: p.image_url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <Text style={{ color: C.muted, fontSize: 28 }}>✦</Text>}
                </View>
                <Text style={{ color: C.ivory, fontSize: 13, fontWeight: "600", marginTop: 8 }} numberOfLines={1}>{p.name}</Text>
                <Text style={{ color: C.gold, fontSize: 12, marginTop: 2 }}>from ${p.base_price ?? "-"}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable onPress={() => Linking.openURL(SITE)} style={{ marginTop: 26, alignItems: "center" }}>
          <Text style={{ color: C.muted, fontSize: 11, letterSpacing: 1 }}>Visit tabor.quest ↗</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
