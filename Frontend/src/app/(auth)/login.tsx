import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/schemas/auth-schema";
import { PasswordInput } from "@/components/password-input";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        bounces={false}
      >
        <View style={styles.card}>
          {/* Logo & Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadgeContainer}>
              <Text style={styles.logoText}>🔒</Text>
            </View>
            <Text style={styles.brandTitle}>Connexion</Text>
            <Text style={styles.brandSubtitle}>
              Portail d'authentification SecureLibrary
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Adresse E-mail</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="saisir votre e-mail..."
                    placeholderTextColor="#A5A6AE"
                    keyboardType="email-address"
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
            </View>
            <PasswordInput
              control={control}
              name="password"
              errors={errors}
              placeholder="saisir votre mot de passe..."
            />

            {/* Status alerts/messages */}
            {message ? (
              <View
                style={[
                  styles.statusToast,
                  message.includes("❌")
                    ? styles.toastError
                    : styles.toastSuccess,
                ]}
              >
                <Text
                  style={[
                    styles.statusToastText,
                    message.includes("❌")
                      ? styles.toastErrorText
                      : styles.toastSuccessText,
                  ]}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            {/* Custom Interactive Button */}
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2F66DD" />
                <Text style={styles.loadingSubText}>
                  Vérification des accès en cours...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.85}
                onPress={handleSubmit(onSubmit)}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer view */}
          <TouchableOpacity
            style={styles.registerLinkContainer}
            activeOpacity={0.7}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.registerLinkText}>
              Pas encore de compte ?{" "}
              <Text style={styles.highlightText}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#2F66DD", // Correspond au fond bleu primaire de votre HomeScreen
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: Platform.OS === "ios" ? 40 : 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  logoBadgeContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#F3F5FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2ECE9",
  },
  logoText: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E2432", // Couleur de titre premium foncée (de home.tsx)
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: "#A5A6AE",
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  formContainer: {
    marginTop: 5,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E2432",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  inputWrapper: {
    backgroundColor: "#F3F5FA", // Conteneurs arrondis modernes
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#Eef1f6",
  },
  input: {
    fontSize: 15,
    color: "#1E2432",
    fontWeight: "500",
  },
  errorText: {
    color: "#D93025",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
    marginLeft: 4,
  },
  statusToast: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 15,
    borderWidth: 1,
  },
  toastSuccess: {
    backgroundColor: "#E6F4EA",
    borderColor: "#D2EBD4",
  },
  toastError: {
    backgroundColor: "#FCE8E6",
    borderColor: "#FAD2CF",
  },
  statusToastText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  toastSuccessText: {
    color: "#137333",
  },
  toastErrorText: {
    color: "#C5221F",
  },
  loginButton: {
    backgroundColor: "#2F66DD", // Thème principal bleu
    borderRadius: 12,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#2F66DD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loadingSubText: {
    color: "#666",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
  registerLinkContainer: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 20,
  },
  registerLinkText: {
    fontSize: 14,
    color: "#A5A6AE",
    fontWeight: "600",
  },
  highlightText: {
    color: "#2F66DD",
    fontWeight: "bold",
  },
});
