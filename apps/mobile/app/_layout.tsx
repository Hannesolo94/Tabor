import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { C } from "@/lib/theme";

function useAuthGate(session: unknown, loading: boolean) {
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "sign-in";
    if (!session && !inAuth) router.replace("/sign-in");
    else if (session && inAuth) router.replace("/(tabs)");
  }, [session, loading, segments, router]);
}

function RootNav() {
  const { session, loading } = useAuth();
  useAuthGate(session, loading);
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
