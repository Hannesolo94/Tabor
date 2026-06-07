import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAuth } from "@/lib/auth";
import { resolveBarcode, addCustomFood, logFood, type Food } from "@/lib/nutrition";
import { C, F } from "@/lib/theme";

const MEALS = ["breakfast", "lunch", "dinner", "snack"];
function defaultMeal() { const h = new Date().getHours(); return h < 11 ? "breakfast" : h < 15 ? "lunch" : h < 20 ? "dinner" : "snack"; }

export default function Scan() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const today = date || new Date().toISOString().slice(0, 10);
  const { session } = useAuth();
  const userId = session?.user.id;
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [food, setFood] = useState<Food | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);
  const [qty, setQty] = useState("100");
  const [meal, setMeal] = useState(defaultMeal());
  // manual add
  const [m, setM] = useState({ name: "", kcal: "", protein: "", carb: "", fat: "" });

  async function onScan(code: string) {
    setLocked(true); setBusy(true);
    const f = await resolveBarcode(code);
    setBusy(false);
    if (f) { setFood(f); setQty(String(f.serving_size_g || 100)); }
    else setNotFound(code);
  }
  async function save() {
    if (!userId || !food) return;
    await logFood(userId, meal, food, Number(qty) || 0, today);
    router.back();
  }
  async function saveManual() {
    if (!userId || !m.name || !m.kcal) return;
    const f = await addCustomFood(userId, { name: m.name, kcal_100g: Number(m.kcal) || 0, protein_100g: Number(m.protein) || undefined, carb_100g: Number(m.carb) || undefined, fat_100g: Number(m.fat) || undefined, barcode: notFound || undefined });
    if (f) { setFood(f); setQty("100"); setNotFound(null); }
  }
  function reset() { setFood(null); setNotFound(null); setLocked(false); }

  if (!permission) return <View style={{ flex: 1, backgroundColor: C.black }} />;
  if (!permission.granted) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black, padding: 26, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: C.gold, fontSize: 11, letterSpacing: 4, fontFamily: F.mono }}>[ GRANT VISION ]</Text>
      <Text style={{ color: C.text, fontSize: 15, fontFamily: F.body, textAlign: "center", marginVertical: 14, lineHeight: 22 }}>TABOR needs the camera to scan food barcodes for your log.</Text>
      <Pressable onPress={requestPermission} style={{ backgroundColor: C.gold, paddingVertical: 13, paddingHorizontal: 30, borderRadius: 2 }}><Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>ALLOW CAMERA</Text></Pressable>
      <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}><Text style={{ color: C.muted, fontFamily: F.body }}>Back</Text></Pressable>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.gold, fontSize: 24 }}>‹</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 18, fontFamily: F.head }}>Scan food</Text>
      </View>

      {!food && !notFound && (
        <View style={{ flex: 1 }}>
          <CameraView style={{ flex: 1 }} barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }} onBarcodeScanned={locked ? undefined : ({ data }) => onScan(data)} />
          <View style={{ position: "absolute", bottom: 30, left: 0, right: 0, alignItems: "center" }}>
            {busy ? <ActivityIndicator color={C.gold} /> : <Text style={{ color: C.ivory, fontFamily: F.mono, fontSize: 12, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 14, paddingVertical: 8 }}>POINT AT A BARCODE</Text>}
          </View>
        </View>
      )}

      {food && (
        <ScrollView contentContainerStyle={{ padding: 22 }}>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono }}>[ ITEM IDENTIFIED ]</Text>
          <Text style={{ color: C.ivory, fontSize: 22, fontFamily: F.head, marginTop: 6 }}>{food.name}</Text>
          {food.brand ? <Text style={{ color: C.muted, fontFamily: F.body, fontSize: 13 }}>{food.brand}</Text> : null}
          <Text style={{ color: C.text, fontFamily: F.mono, fontSize: 12, marginTop: 8 }}>{Math.round(food.kcal_100g)} kcal / 100g · P{food.protein_100g ?? "?"} C{food.carb_100g ?? "?"} F{food.fat_100g ?? "?"}</Text>

          <Text style={lbl}>Amount (grams)</Text>
          <TextInput value={qty} onChangeText={(t) => setQty(t.replace(/[^0-9]/g, ""))} keyboardType="number-pad" style={inp} />
          <Text style={{ color: C.gold, fontFamily: F.mono, fontSize: 13, marginTop: 8 }}>= {Math.round((food.kcal_100g || 0) * (Number(qty) || 0) / 100)} kcal</Text>

          <Text style={lbl}>Meal</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {MEALS.map((x) => <Pressable key={x} onPress={() => setMeal(x)} style={{ borderWidth: 1, borderColor: meal === x ? C.gold : C.line, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 2 }}><Text style={{ color: meal === x ? C.gold : C.muted, fontFamily: F.mono, fontSize: 11 }}>{x.toUpperCase()}</Text></Pressable>)}
          </View>

          <Pressable onPress={save} style={{ backgroundColor: C.gold, paddingVertical: 14, alignItems: "center", borderRadius: 2, marginTop: 20 }}><Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>LOG IT</Text></Pressable>
          <Pressable onPress={reset} style={{ marginTop: 12, alignItems: "center" }}><Text style={{ color: C.muted, fontFamily: F.body }}>Scan another</Text></Pressable>
          {food.source === "off" && <Text style={{ color: C.muted, fontSize: 9, fontFamily: F.mono, textAlign: "center", marginTop: 14 }}>DATA FROM OPEN FOOD FACTS (ODbL)</Text>}
        </ScrollView>
      )}

      {notFound && (
        <ScrollView contentContainerStyle={{ padding: 22 }}>
          <Text style={{ color: C.gold, fontSize: 10, letterSpacing: 3, fontFamily: F.mono }}>[ NOT IN THE DATABASE ]</Text>
          <Text style={{ color: C.text, fontSize: 14, fontFamily: F.body, marginTop: 8, lineHeight: 21 }}>Add it once and it's saved for you. Values per 100g.</Text>
          <TextInput value={m.name} onChangeText={(t) => setM({ ...m, name: t })} placeholder="Product name" placeholderTextColor={C.muted} style={inp} />
          <TextInput value={m.kcal} onChangeText={(t) => setM({ ...m, kcal: t.replace(/[^0-9]/g, "") })} placeholder="Calories / 100g" placeholderTextColor={C.muted} keyboardType="number-pad" style={inp} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput value={m.protein} onChangeText={(t) => setM({ ...m, protein: t })} placeholder="Protein" placeholderTextColor={C.muted} keyboardType="numeric" style={[inp, { flex: 1 }]} />
            <TextInput value={m.carb} onChangeText={(t) => setM({ ...m, carb: t })} placeholder="Carbs" placeholderTextColor={C.muted} keyboardType="numeric" style={[inp, { flex: 1 }]} />
            <TextInput value={m.fat} onChangeText={(t) => setM({ ...m, fat: t })} placeholder="Fat" placeholderTextColor={C.muted} keyboardType="numeric" style={[inp, { flex: 1 }]} />
          </View>
          <Pressable onPress={saveManual} style={{ backgroundColor: C.gold, paddingVertical: 14, alignItems: "center", borderRadius: 2, marginTop: 16 }}><Text style={{ color: C.black, fontFamily: F.head, letterSpacing: 1 }}>ADD & CONTINUE</Text></Pressable>
          <Pressable onPress={reset} style={{ marginTop: 12, alignItems: "center" }}><Text style={{ color: C.muted, fontFamily: F.body }}>Scan again</Text></Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
const lbl = { color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginTop: 18, marginBottom: 6 } as const;
const inp = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 2, fontFamily: F.body, fontSize: 15, marginTop: 8 } as const;
