import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { C } from "@/lib/theme";

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
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.black } }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNav />
    </AuthProvider>
  );
}
