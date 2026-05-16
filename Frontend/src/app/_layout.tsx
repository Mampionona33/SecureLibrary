import { Slot } from "expo-router";

export default function RootLayout() {
  const isLoggedIn = false; // ton état auth
  return <Slot initialRouteName={isLoggedIn ? "(drawer)" : "(auth)"} />;
}
