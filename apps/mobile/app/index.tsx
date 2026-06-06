import { Redirect } from "expo-router";

// Session present -> tabs. No session -> the auth gate in _layout bounces to sign-in.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
