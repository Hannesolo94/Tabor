import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { PirataOne_400Regular } from "@expo-google-fonts/pirata-one";
import { Cinzel_600SemiBold, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { CormorantGaramond_500Medium_Italic } from "@expo-google-fonts/cormorant-garamond";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ensureKeys } from "@/lib/crypto";
import { registerForPush } from "@/lib/push";
import { refreshLiturgicalReminders } from "@/lib/litReminders";
import { DonationPrompt } from "@/components/DonationPrompt";
import { ActionSheetProvider } from "@/components/ActionSheet";
import { UnitsProvider } from "@/lib/units";
import { C, F } from "@/lib/theme";

function useAuthGate(session: unknown, loading: boolean, onboarded: boolean | null) {
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "sign-in";
    const inOnboarding = segments[0] === "onboarding";

    if (!session) {
      if (!inAuth) router.replace("/sign-in");
      return;
    }
    // signed in — wait until we know onboarding status
    if (onboarded === null) return;
    if (!onboarded) {
      if (!inOnboarding) router.replace("/onboarding");
    } else if (inAuth || inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [session, loading, onboarded, segments, router]);
}

function RootNav() {
  const { session, loading, onboarded } = useAuth();
  useAuthGate(session, loading, onboarded);
  useEffect(() => { if (session?.user) { ensureKeys(session.user.id).catch(() => {}); registerForPush(session.user.id).catch(() => {}); refreshLiturgicalReminders(session.user.id).catch(() => {}); } }, [session]);
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.black } }} />
      <DonationPrompt enabled={!!session && onboarded === true} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PirataOne_400Regular,
    Cinzel_600SemiBold, Cinzel_700Bold,
    Inter_400Regular, Inter_600SemiBold, Inter_700Bold,
    JetBrainsMono_400Regular,
    CormorantGaramond_500Medium_Italic,
  });
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: C.black, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.gold} /></View>;
  }
  return (
    <AuthProvider>
      <UnitsProvider>
        <ActionSheetProvider>
          <RootNav />
        </ActionSheetProvider>
      </UnitsProvider>
    </AuthProvider>
  );
}
