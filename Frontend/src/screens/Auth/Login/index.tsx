// screens/Auth/Login/index.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';

import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

import { useAuthStore } from '@store/useAuthStore';
import { useAppTheme } from '@theme/useAppTheme';
import { loginSchema, LoginFormType } from './schema';
import { styles } from './styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { login, isLoading: isLoadingAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { theme, isDark } = useAppTheme();
  const { colors, radius, spacing } = theme;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: valibotResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormType) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);

      if (!result.success) {
        if (result.message && result.message.toLowerCase().includes("en attente")) {
          navigation.navigate('PendingApproval', { 
            email: data.email, 
            password: data.password 
          });
          return;
        }
        Alert.alert('Erreur de connexion', result.message || 'Une erreur est survenue.');
      }
      // ✅ Si succès, la navigation est gérée automatiquement par AppNavigator
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de joindre le service de sécurité.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[styles.container, { paddingHorizontal: spacing.lg }]} 
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.headerContainer, { marginBottom: spacing.xl }]}>
            <Text style={styles.logoIcon}>🔒</Text>
            <Text style={[styles.title, { color: colors.text, marginBottom: spacing.sm }]}>SecureLibrary</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Bibliothèque Chiffrée & Coffre-fort Numérique
            </Text>
          </View>

          <View style={[
            styles.formContainer, 
            { 
              backgroundColor: colors.surface, 
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg
            }
          ]}>
            
            {/* Email */}
            <Text style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}>Adresse Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: colors.inputBorder,
                    borderRadius: radius.md,
                    height: 48,
                    paddingHorizontal: spacing.sm
                  },
                  errors.email && { borderColor: colors.danger }
                ]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="exemple@domaine.com"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading && !isLoadingAuth}
                  />
                </View>
              )}
            />
            {errors.email && <Text style={[styles.errorText, { color: colors.danger, marginTop: spacing.xs }]}>{errors.email.message}</Text>}

            {/* Mot de passe */}
            <Text style={[styles.label, { color: colors.text, marginBottom: spacing.xs, marginTop: spacing.md }]}>Mot de passe</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    borderColor: colors.inputBorder,
                    borderRadius: radius.md,
                    height: 48,
                    paddingHorizontal: spacing.sm
                  },
                  errors.password && { borderColor: colors.danger }
                ]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="••••••••"
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading && !isLoadingAuth}
                  />
                  <TouchableOpacity
                    style={{ paddingLeft: spacing.sm }}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                      {showPassword ? 'Cacher' : 'Voir'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={[styles.errorText, { color: colors.danger, marginTop: spacing.xs }]}>{errors.password.message}</Text>}

            {/* Bouton Connexion */}
            <TouchableOpacity
              style={[
                styles.submitButton, 
                { 
                  backgroundColor: colors.buttonPrimary,
                  borderRadius: radius.md,
                  marginTop: spacing.xl,
                  height: 48
                },
                (isLoading || isLoadingAuth) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading || isLoadingAuth}
            >
              {(isLoading || isLoadingAuth) ? (
                <ActivityIndicator color={colors.buttonPrimaryText} />
              ) : (
                <Text style={[styles.submitButtonText, { color: colors.buttonPrimaryText }]}>Se connecter</Text>
              )}
            </TouchableOpacity>

            {/* Redirection vers Inscription */}
            <View style={[styles.footer, { marginTop: spacing.lg }]}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                Pas encore de compte ?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>S'inscrire</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
