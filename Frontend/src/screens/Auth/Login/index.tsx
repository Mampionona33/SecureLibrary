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
import { AuthStackParamList } from '@navigation/types';

// React Hook Form & Valibot
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

// Architecture, Contextes et Co-localisation
import { loginSchema, LoginFormType } from './schema';
import { styles } from './styles';
import { useAuth } from '@context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // On consomme la méthode login connectée au backend depuis le contexte global
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: valibotResolver(loginSchema),
    mode: 'onChange', // Valide les champs en temps réel (UX propre)
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormType) => {
    setIsLoading(true); // On active le spinner

    try {
      const result = await login(data.email, data.password);

      if (!result.success) {
        // Si le serveur rejette les identifiants, on arrête le chargement et on prévient l'utilisateur
        setIsLoading(false);
        Alert.alert('Échec de la connexion', result.message);
      }
      
      // CRUCIAL : Si result.success est TRUE, on ne coupe pas "isLoading" et on ne navigue pas manuellement.
      // Le AuthContext a déjà mis à jour les états globaux. L'AppNavigator va capter le changement
      // et démonter automatiquement cet écran pour afficher la bonne Stack (MainStack, PendingApproval, etc.).

    } catch (error) {
      setIsLoading(false);
      Alert.alert('Erreur', 'Impossible de joindre le serveur de sécurité.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* En-tête de la page */}
        <View style={styles.headerContainer}>
          <Text style={styles.logoIcon}>📚</Text>
          <Text style={styles.title}>Bibliothèque</Text>
          <Text style={styles.titleHighlight}>Sécurisée</Text>
          <Text style={styles.subtitle}>Accédez à vos archives protégées</Text>
        </View>

        {/* Formulaire de saisie */}
        <View style={styles.formContainer}>
          
          {/* Identifiant / Email */}
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

          {/* Mot de passe */}
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

          {/* Mot de passe oublié */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Bouton de Connexion principale */}
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

          {/* Bouton Biométrie (Placeholder optionnel) */}
          <TouchableOpacity 
            style={styles.biometricButton}
            onPress={() => Alert.alert('Biométrie', 'Veuillez d\'abord configurer votre coffre fort local.')}
          >
            <Text style={styles.biometricIcon}>🔒</Text>
            <Text style={styles.biometricText}>Connexion biométrique</Text>
          </TouchableOpacity>

          {/* Lien vers l'inscription */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: '#1e3a8a', fontWeight: 'bold', fontSize: 14 }}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
