import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { register } from "@/services/auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/schemas/auth-schema";
import { PasswordInput } from "@/components/password-input";

export default function RegisterScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data);
      setMessage("Inscription réussie ✅");
      router.replace("/(auth)/login");
    } catch (err) {
      setMessage("Erreur lors de l'inscription ❌");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <Controller
        control={control}
        name="first_name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Prénom"
            style={styles.input}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.first_name && (
        <Text style={styles.errorText}>{errors.first_name.message}</Text>
      )}

      <Controller
        control={control}
        name="last_name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Nom"
            style={styles.input}
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.last_name && (
        <Text style={styles.errorText}>{errors.last_name.message}</Text>
      )}

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

      <PasswordInput
        control={control}
        name="password"
        errors={errors}
        placeholder="Mot de passe"
      />

      <PasswordInput
        control={control}
        name="confirmPassword"
        errors={errors}
        placeholder="Confirmer le mot de passe"
      />

      {isSubmitting ? (
        <ActivityIndicator
          size="large"
          color="#5A5A40"
          style={{ marginVertical: 10 }}
        />
      ) : (
        <Button title="S'inscrire" onPress={handleSubmit(onSubmit)} />
      )}

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
  errorText: { color: "red", fontSize: 12, marginBottom: 10, marginLeft: 5 },
});
