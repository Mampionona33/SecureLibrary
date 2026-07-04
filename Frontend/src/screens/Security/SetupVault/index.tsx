import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useVault } from '@context/VaultContext';

// Import local (Co-localisation)
import { setupVaultSchema, SetupVaultFormType } from './schema';
import { styles } from './styles';

// On imagine que le hook useVault viendra du contexte plus tard
// import { useVault } from '@context/VaultContext';

const SetupVaultScreen = () => {
  // const { setupLocalVault } = useVault();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setupLocalVault } = useVault();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupVaultFormType>({
    resolver: valibotResolver(setupVaultSchema),
    defaultValues: {
      pin: '',
      confirmPin: '',
    },
  });

  const onSubmit = async (data: SetupVaultFormType) => {
    // La validation (data.pin === data.confirmPin) est maintenant gérée automatiquement 
    // par le resolver Valibot en amont. Le code n'arrive ici que si les PIN sont identiques.

    setIsSubmitting(true);
    try {
      // 1. Appel au contexte pour sauvegarder le PIN de manière sécurisée (Keychain natif)
      await setupLocalVault(data.pin);
      
      console.log('Coffre configuré avec le PIN :', data.pin);
      Alert.alert('Succès', 'Votre coffre local est sécurisé !');
      
      // La navigation vers AuthStack se fera automatiquement 
      // grâce à AppNavigator qui réagit au changement d'état de useVault()
      
    } catch (error) {
      console.error("Erreur lors de la configuration du coffre :", error);
      Alert.alert('Erreur', 'Impossible de configurer le coffre local.');
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
          <Text style={styles.icon}>🛡️</Text>
        </View>
        
        <Text style={styles.title}>Sécurité Locale</Text>
        <Text style={styles.subtitle}>
          Créez un code PIN à 4 chiffres pour protéger vos données hors ligne.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nouveau code PIN</Text>
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
              />
            )}
          />
          {errors.pin && <Text style={styles.errorText}>{errors.pin.message}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmer le code PIN</Text>
          <Controller
            control={control}
            name="confirmPin"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.confirmPin && styles.inputErrorBorder]}
                placeholder="••••"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.confirmPin && <Text style={styles.errorText}>{errors.confirmPin.message}</Text>}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Configuration...' : 'Sécuriser mon accès'}
          </Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SetupVaultScreen;
