import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/useProfile";
import { uploadAvatar, updateProfile } from "@/lib/profile";
import { C, F } from "@/lib/theme";

export default function EditProfile() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile } = useProfile();
  const userId = session?.user.id;
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile && !ready) {
      setName(String(profile.name ?? ""));
      setHandle(String(profile.handle ?? ""));
      setBio(String(profile.bio ?? ""));
      setAvatar((profile.avatar_url as string) ?? null);
      setReady(true);
    }
  }, [profile, ready]);

  async function pickAvatar() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow photo access to set a profile picture."); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (res.canceled || !res.assets?.[0]?.base64 || !userId) return;
    setBusy(true);
    const ext = (res.assets[0].uri || "").toLowerCase().endsWith(".png") ? "png" : "jpg";
    const url = await uploadAvatar(userId, res.assets[0].base64, ext);
    setBusy(false);
    if (url) setAvatar(url); else Alert.alert("Upload failed", "Try again.");
  }

  async function save() {
    if (!userId) return;
    const h = handle.trim().replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    setBusy(true);
    const { error } = await updateProfile(userId, { name: name.trim(), handle: h || undefined, bio: bio.trim() || null, avatar_url: avatar });
    setBusy(false);
    if (error) { Alert.alert("Couldn't save", /duplicate|unique/i.test(error) ? "That handle is already taken. Try another." : error); return; }
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={{ color: C.muted, fontFamily: F.body }}>Cancel</Text></Pressable>
        <Text style={{ color: C.ivory, fontSize: 16, fontWeight: "800", fontFamily: F.head }}>Edit Profile</Text>
        <Pressable onPress={save} disabled={busy} hitSlop={10}><Text style={{ color: busy ? C.muted : C.gold, fontFamily: F.bodyMid }}>{busy ? "…" : "Save"}</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={pickAvatar} style={{ alignSelf: "center", alignItems: "center", marginBottom: 22 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: C.surface, borderWidth: 1, borderColor: C.gold, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
            {avatar ? <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} /> : <Text style={{ color: C.gold, fontSize: 38, fontFamily: F.head }}>{(name || "B")[0]?.toUpperCase()}</Text>}
          </View>
          <Text style={{ color: C.gold, fontSize: 11, fontFamily: F.mono, marginTop: 8, letterSpacing: 1 }}>{busy ? "UPLOADING…" : "CHANGE PHOTO"}</Text>
        </Pressable>

        <Text style={lbl}>Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={C.muted} style={inp} />

        <Text style={lbl}>Username</Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 2, marginTop: 8, paddingLeft: 12 }}>
          <Text style={{ color: C.muted, fontFamily: F.body, fontSize: 15 }}>@</Text>
          <TextInput value={handle} onChangeText={(t) => setHandle(t.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())} autoCapitalize="none" placeholder="handle" placeholderTextColor={C.muted} style={{ flex: 1, color: C.ivory, paddingHorizontal: 6, paddingVertical: 12, fontSize: 15, fontFamily: F.body }} />
        </View>

        <Text style={lbl}>Bio</Text>
        <TextInput value={bio} onChangeText={(t) => setBio(t.slice(0, 200))} placeholder="A line about you. The brothers see this." placeholderTextColor={C.muted} multiline style={[inp, { height: 90, textAlignVertical: "top" }]} />
        <Text style={{ color: C.muted, fontSize: 10, fontFamily: F.mono, textAlign: "right", marginTop: 4 }}>{bio.length}/200</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const lbl = { color: C.gold, fontSize: 10, letterSpacing: 2, fontFamily: F.mono, marginTop: 16 } as const;
const inp = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, color: C.ivory, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginTop: 8, borderRadius: 2, fontFamily: F.body } as const;
