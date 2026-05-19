import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Drawer } from "expo-router/drawer";

export default function AppLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Drawer>
        <Drawer.Screen name="home" options={{ title: "Accueil" }} />
        <Drawer.Screen name="explore" options={{ title: "Explorer" }} />
        <Drawer.Screen
          name="add-book"
          options={{ title: "Ajouter un livre" }}
        />
        <Drawer.Screen name="settings" options={{ title: "Paramètres" }} />
        {/* ✅ Ajout du bouton Déconnexion */}
        <Drawer.Screen name="logout" options={{ title: "Déconnexion" }} />
      </Drawer>
    </ThemeProvider>
  );
}
