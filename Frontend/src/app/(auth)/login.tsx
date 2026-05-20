import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/schemas/auth-schema";

export default function LoginScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const tokens = await login(data.email, data.password);
      await AsyncStorage.setItem("accessToken", tokens.access);
      await AsyncStorage.setItem("refreshToken", tokens.refresh);

      setMessage("Connexion réussie ✅");
      router.replace("/(drawer)/home");
    } catch (err) {
      setMessage("Email ou mot de passe invalide ❌");
    } finally {
      reset();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            style={styles.input}
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Mot de passe"
            secureTextEntry
            style={styles.input}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )}

      {isSubmitting ? (
        <ActivityIndicator
          size="large"
          color="#5A5A40"
          style={{ marginVertical: 10 }}
        />
      ) : (
        <Button title="Se connecter" onPress={handleSubmit(onSubmit)} />
      )}

      {message ? (
        <Text style={{ textAlign: "center", marginTop: 10 }}>{message}</Text>
      ) : null}

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
  errorText: { color: "red", fontSize: 12, marginBottom: 10, marginLeft: 5 },
});
