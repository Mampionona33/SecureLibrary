import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        style={styles.input}
      />
      <Button title="Se connecter" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});
