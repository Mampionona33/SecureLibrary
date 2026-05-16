import { View, Text, StyleSheet, Button } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue dans ta Bibliothèque 📚</Text>
      <Text style={styles.subtitle}>
        Ici tu peux explorer tes livres, suivre ta progression et gérer ton
        profil.
      </Text>

      <Button title="Explorer" onPress={() => navigation.navigate("explore")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
});
