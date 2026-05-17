import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { register } from "@/services/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas ❌");
      return;
    }

    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      setMessage("Inscription réussie ✅");
      router.replace("/(auth)/login");
    } catch (err) {
      setMessage("Erreur lors de l'inscription ❌");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <TextInput
        placeholder="Prénom"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Nom"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Confirmer Mot de passe"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button title="S'inscrire" onPress={handleRegister} />

      {message ? <Text style={{ textAlign: "center" }}>{message}</Text> : null}

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: "#5A5A40",
    fontWeight: "600",
  },
});
