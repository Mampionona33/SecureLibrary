import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';

// Imports co-localisés et globaux
import { unlockVaultSchema, UnlockVaultFormType } from './schema';
import { styles } from './styles';
import { useVault } from '@context/VaultContext';

const UnlockVaultScreen = () => {
  const { unlockVault } = useVault();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UnlockVaultFormType>({
    resolver: valibotResolver(unlockVaultSchema),
    defaultValues: {
      pin: '',
    },
  });

  const onSubmit = async (data: UnlockVaultFormType) => {
    setIsSubmitting(true);
    try {
      // On envoie le PIN saisi au Keychain via le contexte
      const success = await unlockVault(data.pin);
      
      if (!success) {
        Alert.alert('Échec', 'Code PIN incorrect.');
        reset({ pin: '' }); // On vide le champ en cas d'erreur
      }
      // Si success est true, AppNavigator le détecte et bascule tout seul !
      
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de vérifier le code PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔓</Text>
        </View>

        <Text style={styles.title}>Application Verrouillée</Text>
        <Text style={styles.subtitle}>
          Veuillez saisir votre code PIN à 4 chiffres pour accéder à la bibliothèque.
        </Text>

        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="pin"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.pin && styles.inputErrorBorder]}
                placeholder="••••"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isSubmitting}
                autoFocus={true} // Ouvre le clavier directement au chargement
              />
            )}
          />
          {errors.pin && <Text style={styles.errorText}>{errors.pin.message}</Text>}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Déverrouiller</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.biometricButton}
          onPress={() => Alert.alert('Biométrie', 'FaceID / TouchID bientôt disponible.')}
        >
          <Text style={styles.biometricText}>Utiliser la biométrie</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UnlockVaultScreen;
