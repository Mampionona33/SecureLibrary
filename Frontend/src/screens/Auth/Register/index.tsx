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
  ScrollView // Ajout du ScrollView pour éviter que le clavier ne cache les champs
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';

import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

import { registerSchema, RegisterFormType } from './schema';
import { styles } from './styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Inscription demandée pour :', data.firstName, data.lastName);
      
      Alert.alert(
        'Succès', 
        'Votre compte a été créé. Un administrateur doit valider votre accès.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Erreur', "Impossible de procéder à l'inscription.");
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
            <Text style={styles.logoIcon}>✍️</Text>
            <Text style={styles.title}>Créer un</Text>
            <Text style={styles.titleHighlight}>Compte Accès</Text>
            <Text style={styles.subtitle}>Rejoignez la bibliothèque sécurisée</Text>
          </View>

          <View style={styles.formContainer}>
            
            {/* Champ Nom */}
            <Text style={styles.label}>Nom</Text>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.lastName && styles.inputErrorBorder]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Dupont"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName.message}</Text>}

            {/* Champ Prénom */}
            <Text style={styles.label}>Prénom</Text>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.firstName && styles.inputErrorBorder]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Jean"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!isLoading}
                  />
                </View>
              )}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName.message}</Text>}
            
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

            {/* Champ Confirmation Mot de passe */}
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputErrorBorder]}>
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
                </View>
              )}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}

            {/* Bouton de soumission */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            {/* Lien de retour au Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
