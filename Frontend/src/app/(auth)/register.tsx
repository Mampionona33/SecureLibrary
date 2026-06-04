import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { register } from "@/services/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData, registerSchema } from "@/schemas/auth-schema";
import { FormInput } from "@/components/form-input";
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react-native";

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
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500); // Petit délai pour laisser l'utilisateur voir le badge de succès
    } catch (err) {
      setMessage("Erreur lors de l'inscription ❌");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FDFCFB" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bouton retour en haut à gauche */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <ArrowLeft color="#1E2432" size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Inscrivez-vous pour rejoindre notre bibliothèque hautement
            sécurisée.
          </Text>
        </View>

        {/* Formulaire utilisant FormInput de manière homogène */}
        <View style={styles.form}>
          <FormInput
            control={control}
            name="first_name"
            placeholder="Prénom"
            icon={<User color="#A5A6AE" size={20} />}
            autoCorrect={false}
          />

          <FormInput
            control={control}
            name="last_name"
            placeholder="Nom"
            icon={<User color="#A5A6AE" size={20} />}
            autoCorrect={false}
          />

          <FormInput
            control={control}
            name="email"
            placeholder="Adresse email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon={<Mail color="#A5A6AE" size={20} />}
          />

          <FormInput
            control={control}
            name="password"
            placeholder="Mot de passe"
            isPassword={true}
            icon={<Lock color="#A5A6AE" size={20} />}
          />

          <FormInput
            control={control}
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            isPassword={true}
            icon={<Lock color="#A5A6AE" size={20} />}
          />

          {/* Bannière de notification stylisée */}
          {message ? (
            <View
              style={[
                styles.messageBanner,
                message.includes("Erreur")
                  ? styles.errorBanner
                  : styles.successBanner,
              ]}
            >
              {message.includes("Erreur") ? (
                <AlertTriangle size={18} color="#FF4D4F" />
              ) : (
                <CheckCircle2 size={18} color="#4CAF50" />
              )}
              <Text
                style={[
                  styles.messageText,
                  message.includes("Erreur")
                    ? styles.errorText
                    : styles.successText,
                ]}
              >
                {message}
              </Text>
            </View>
          ) : null}

          {/* Bouton de soumission élégant et progressif */}
          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Lien de redirection vers le login */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.linkLabel}>
            Déjà un compte ? <Text style={styles.linkText}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCFB",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingBottom: 40,
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
    padding: 4,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E2432",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9A9A9A",
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  successBanner: {
    backgroundColor: "#E8F5E9",
    borderColor: "#C8E6C9",
  },
  errorBanner: {
    backgroundColor: "#FFEBEE",
    borderColor: "#FFCDD2",
  },
  messageText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  successText: {
    color: "#2E7D32",
  },
  errorText: {
    color: "#C62828",
  },
  button: {
    backgroundColor: "#2F66DD",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#2F66DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#8FA3DF",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  linkContainer: {
    alignItems: "center",
    marginTop: 28,
  },
  linkLabel: {
    color: "#9A9A9A",
    fontSize: 14,
  },
  linkText: {
    color: "#2F66DD",
    fontWeight: "bold",
  },
});
