import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { Seal } from "@/components/Seal";
import { C, F } from "@/lib/theme";

export default function SignIn() {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function submit() {
    setBusy(true); setError(""); setNotice(""); setNeedsConfirm(false);
    const res = mode === "in" ? await signIn(email, password) : await signUp(email, password, name);
    if (res.error) {
      if (/confirm/i.test(res.error)) { setNeedsConfirm(true); setError("Confirm your email to enter. Check your inbox."); }
      else setError(res.error);
    } else if (mode === "up") {
      // strict-but-warm: send them to sign-in once they've confirmed
      setMode("in"); setPassword("");
      setNotice("Account forged. We've sent a confirmation link to your email. Confirm it, then sign in here.");
    }
    setBusy(false);
  }

  async function resend() {
    setBusy(true); setError(""); setNotice("");
    const { error: e } = await resendConfirmation(email);
    setBusy(false);
    if (e) setError(e); else { setNotice("Confirmation email sent. Check your inbox."); setNeedsConfirm(false); }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.black }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 28 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <Seal size={72} />
            <Text style={{ color: C.gold, fontSize: 44, fontFamily: F.display, letterSpacing: 2, marginTop: 16 }}>TABOR</Text>
            <Text style={{ color: C.muted, fontSize: 11, letterSpacing: 4, marginTop: 4 }}>SONS OF FIRE</Text>
          </View>

          <Text style={{ color: C.ivory, fontSize: 13, letterSpacing: 3, marginBottom: 14, textAlign: "center" }}>
            {mode === "in" ? "[ ENTER THE BROTHERHOOD ]" : "[ THE AWAKENING ]"}
          </Text>

          {mode === "up" && (
            <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={C.muted} autoCapitalize="words" style={inp} />
          )}
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={C.muted} autoCapitalize="none" keyboardType="email-address" style={inp} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={C.muted} secureTextEntry style={inp} />

          {!!error && <Text style={{ color: C.red, fontSize: 12, marginTop: 4 }}>{error}</Text>}
          {!!notice && <Text style={{ color: C.green, fontSize: 12, marginTop: 4 }}>{notice}</Text>}
          {needsConfirm && (
            <Pressable onPress={resend} disabled={busy} style={{ marginTop: 8, alignItems: "center" }}>
              <Text style={{ color: C.gold, fontSize: 13, fontFamily: F.bodyMid, textDecorationLine: "underline" }}>Resend confirmation email</Text>
            </Pressable>
          )}

          <Pressable onPress={submit} disabled={busy} style={{ marginTop: 18, backgroundColor: C.gold, paddingVertical: 16, alignItems: "center", borderRadius: 12, opacity: busy ? 0.6 : 1 }}>
            {busy ? <ActivityIndicator color={C.black} /> : <Text style={{ color: C.black, fontWeight: "800", fontFamily: F.head, letterSpacing: 2 }}>{mode === "in" ? "ENTER" : "AWAKEN"}</Text>}
          </Pressable>

          <Pressable onPress={() => { setMode(mode === "in" ? "up" : "in"); setError(""); setNotice(""); }} style={{ marginTop: 18, alignItems: "center" }}>
            <Text style={{ color: C.muted, fontSize: 12 }}>
              {mode === "in" ? "No account yet? " : "Already a brother? "}
              <Text style={{ color: C.gold }}>{mode === "in" ? "Begin the Awakening" : "Sign in"}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const inp = {
  backgroundColor: C.surface,
  borderColor: "rgba(201,169,97,0.3)",
  borderWidth: 1,
  color: C.ivory,
  paddingHorizontal: 14,
  paddingVertical: 13,
  fontSize: 15,
  marginTop: 10,
  borderRadius: 12,
} as const;
