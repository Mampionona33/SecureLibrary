import { Redirect } from "expo-router";

export default function Index() {
  const isLoggedIn = false; // ton état auth réel (context, redux, etc.)

  if (isLoggedIn) {
    return <Redirect href="/(drawer)/home" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
