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

// Import local (Co-localisation)
import { setupVaultSchema, SetupVaultFormType } from './schema';
import { styles } from './styles';

// On imagine que le hook useVault viendra du contexte plus tard
// import { useVault } from '@context/VaultContext';

const SetupVaultScreen = () => {
  // const { setupLocalVault } = useVault();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // 1. Validation manuelle : Vérifier que les deux PIN correspondent
    if (data.pin !== data.confirmPin) {
      Alert.alert('Erreur', 'Les codes PIN ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Appel au contexte pour sauvegarder le PIN (Keychain)
      // await setupLocalVault(data.pin);
      
      console.log('Coffre configuré avec le PIN :', data.pin);
      Alert.alert('Succès', 'Votre coffre local est sécurisé !');
      
      // La navigation vers AuthStack se fera automatiquement 
      // grâce à AppNavigator qui écoute l'état de useVault()
      
    } catch (error) {
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
