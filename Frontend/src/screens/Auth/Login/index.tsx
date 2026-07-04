import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types'; // <-- Typage mis à jour avec la pile Auth

// Importations React Hook Form & Valibot
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

// Importations de notre architecture
import { loginSchema, LoginFormType } from './schema';
import { useAuth } from '@context/AuthContext'; // <-- On utilise le contexte global au lieu du service direct
import { styles } from './styles'; // Si tu souhaites ré-isoler le style ou garder StyleSheet en bas

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // On récupère la méthode de connexion depuis notre contexte centralisé
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: valibotResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormType) => {
    setIsLoading(true);

    try {
      // On déclenche la connexion. C'est le contexte qui va stocker le token et modifier 
      // l'état de l'application (isAuthenticated = true)
      await login(data.email, data.password);
      
      // PLUS DE REPLACEMENT MANUEL ICI !
      // AppNavigator s'occupe de faire basculer l'utilisateur automatiquement.
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Échec', 'Identifiants incorrects. Veuillez réessayer.');
      } else {
        Alert.alert('Erreur', 'Impossible de se connecter au serveur.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.logoIcon}>📚</Text>
          <Text style={styles.title}>Bibliothèque</Text>
          <Text style={styles.titleHighlight}>Sécurisée</Text>
          <Text style={styles.subtitle}>Accédez à vos archives protégées</Text>
        </View>

        <View style={styles.formContainer}>
          
          <Text style={styles.label}>Identifiant ou Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={[styles.inputContainer, errors.email && styles.inputErrorBorder]}>
                <TextInput
                  style={styles.input}
                  placeholder="votre@email.com"
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

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.biometricButton}>
            <Text style={styles.biometricIcon}>🔒</Text>
            <Text style={styles.biometricText}>Connexion biométrique</Text>
          </TouchableOpacity>

          {/* Ajout d'un lien vers l'inscription pour utiliser ta pile AuthStack */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#6b7280' }}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: '#1e3a8a', fontWeight: 'bold' }}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
