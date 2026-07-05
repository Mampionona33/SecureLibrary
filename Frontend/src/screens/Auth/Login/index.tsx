import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';

import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

import { useAuth } from '../../../context/AuthContext';
import { loginSchema, LoginFormType } from './schema';
import { styles } from './styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        // 🟢 SÉCURITÉ & INTERCEPTION DU PENDING DICTÉ PAR DJANGO
        // Si le message d'erreur renvoyé par le contexte contient les mots clés d'attente
        if (result.message && result.message.toLowerCase().includes("en attente")) {
          // On dévie proprement la navigation vers l'écran d'attente en lui transmettant les informations
          navigation.navigate('PendingApproval', { 
            email: data.email, 
            password: data.password 
          });
          return; // Interrompt la fonction ici pour ne PAS déclencher l'Alert.alert() générale
        }

        // Erreur classique (Identifiants invalides ou mauvaise saisie)
        Alert.alert('Erreur de connexion', result.message || 'Une erreur est survenue.');
      }
      
      // Si result.success est vrai, l'état global du contexte change, 
      // et AppNavigator se charge de basculer automatiquement sur la MainStack.
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de joindre le service de sécurité.');
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
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.logoIcon}>🔒</Text>
            <Text style={styles.title}>SecureLibrary</Text>
            <Text style={styles.subtitle}>Bibliothèque Chiffrée & Coffre-fort Numérique</Text>
          </View>

          <View style={styles.formContainer}>
            
            {/* Champ Email */}
            <Text style={styles.label}>Adresse Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.email && styles.inputErrorBorder]}>
                  <TextInput
                    style={styles.input}
                    placeholder="exemple@domaine.com"
                    placeholderTextColor="#9ca3af"
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
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            {/* Champ Mot de passe */}
            <Text style={styles.label}>Mot de passe</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.password && styles.inputErrorBorder]}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.toggleText}>{showPassword ? 'Cacher' : 'Voir'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

            {/* Bouton Connexion */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            {/* Redirection vers Inscription */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
