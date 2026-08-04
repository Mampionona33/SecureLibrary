import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';

import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

// Importation du thème centralisé
import { useAppTheme } from '@theme/useAppTheme';

// Importation sécurisée de la racine de l'API
import { API_URL } from '@env';

import { registerSchema, RegisterFormType } from './schema';
import { useStyles } from './styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🟢 Extraction du thème et génération des styles dynamiques
  const { theme } = useAppTheme();
  const { colors } = theme;
  const styles = useStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormType>({
    resolver: valibotResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormType) => {
    setIsLoading(true);
    try {
      const payload = {
        username: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      };

      const baseUrl = API_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${baseUrl}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = "Impossible de procéder à l'inscription.";

        if (responseData && typeof responseData === 'object') {
          const firstKey = Object.keys(responseData)[0];
          if (firstKey && responseData[firstKey]) {
            errorMessage = Array.isArray(responseData[firstKey])
              ? responseData[firstKey][0]
              : responseData[firstKey];
          }
        }
        throw new Error(errorMessage);
      }

      Alert.alert(
        'Succès',
        'Votre compte a été créé. Un administrateur doit valider votre accès.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Le serveur de sécurité est injoignable.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.logoIcon}>✍️</Text>
            <Text style={styles.title}>Créer un</Text>
            <Text style={styles.titleHighlight}>Compte Accès</Text>
            <Text style={styles.subtitle}>
              Rejoignez la bibliothèque sécurisée
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Champ Nom */}
            <Text style={styles.label}>Nom</Text>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.lastName ? styles.inputErrorBorder : undefined,
                  ]}
                >
                  <TextInput
                    testID="register-lastname"
                    style={styles.input}
                    placeholder="Dupont"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}

            {/* Champ Prénom */}
            <Text style={styles.label}>Prénom</Text>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.firstName ? styles.inputErrorBorder : undefined,
                  ]}
                >
                  <TextInput
                    testID="register-firstname"
                    style={styles.input}
                    placeholder="Jean"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}

            {/* Champ Email */}
            <Text style={styles.label}>Adresse Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.email ? styles.inputErrorBorder : undefined,
                  ]}
                >
                  <TextInput
                    testID="register-email"
                    style={styles.input}
                    placeholder="exemple@domaine.com"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* Champ Mot de passe */}
            <Text style={styles.label}>Mot de passe</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.password ? styles.inputErrorBorder : undefined,
                  ]}
                >
                  <TextInput
                    testID="register-password"
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    testID="register-toggle-password"
                    style={styles.toggleButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.toggleText}>
                      {showPassword ? 'Cacher' : 'Voir'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* Champ Confirmation Mot de passe */}
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.confirmPassword
                      ? styles.inputErrorBorder
                      : undefined,
                  ]}
                >
                  <TextInput
                    testID="register-confirm-password"
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>
                {errors.confirmPassword.message}
              </Text>
            )}

            {/* Bouton de soumission */}
            <TouchableOpacity
              testID="register-submit"
              style={[
                styles.submitButton,
                isLoading ? styles.submitButtonDisabled : undefined,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.buttonPrimaryText} />
              ) : (
                <Text style={styles.submitButtonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            {/* Lien vers Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Déjà un compte ? </Text>
              <TouchableOpacity
                testID="register-login-link"
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.footerLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
