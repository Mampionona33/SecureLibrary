import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";

export default function HomePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SecureLibrary 📚</Text>
      <Text style={styles.subtitle}>
        Your digital library at your fingertips
      </Text>

      <Button title="Explore" onPress={() => router.push("/explore")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 16, color: "gray", marginBottom: 20 },
});
