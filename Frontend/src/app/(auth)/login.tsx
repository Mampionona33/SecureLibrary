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
import axios from "axios";
import { login } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const tokens = await login(email, password);
      await AsyncStorage.setItem("accessToken", tokens.access);
      await AsyncStorage.setItem("refreshToken", tokens.refresh);

      setMessage("Connexion réussie ✅");
      router.replace("/(drawer)/home");
    } catch (err) {
      setMessage("Email ou mot de passe invalide ❌");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

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

      <Button title="Se connecter" onPress={handleLogin} />

      {message ? <Text style={{ textAlign: "center" }}>{message}</Text> : null}

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Pas encore de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FDFCFB",
  },
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
