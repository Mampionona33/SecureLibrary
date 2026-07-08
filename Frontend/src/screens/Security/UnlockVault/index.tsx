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

import { unlockVaultSchema, UnlockVaultFormType } from './schema';
import { styles } from './styles';
import { useVault } from '@context/VaultContext';
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Import du thème

const UnlockVaultScreen = () => {
  const { unlockVault } = useVault();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🟢 Extraction dynamique du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

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
      const success = await unlockVault(data.pin);
      
      if (!success) {
        Alert.alert('Échec', 'Code PIN incorrect.');
        reset({ pin: '' });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de vérifier le code PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { padding: spacing.lg }]}
      >
        <View style={[styles.iconContainer, { marginBottom: spacing.xl }]}>
          <Text style={styles.icon}>🔓</Text>
        </View>

        <Text style={[styles.title, { color: colors.text, marginBottom: spacing.xs }]}>
          Application Verrouillée
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
          Veuillez saisir votre code PIN à 4 chiffres pour accéder à la bibliothèque.
        </Text>

        <View style={[styles.inputContainer, { marginBottom: spacing.lg }]}>
          <Controller
            control={control}
            name="pin"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    borderRadius: radius.md,
                    color: colors.text,
                    padding: spacing.md,
                  },
                  errors.pin && { borderColor: colors.danger } // 🟢 Couleur d'erreur du thème
                ]}
                placeholder="••••"
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!isSubmitting}
                autoFocus={true}
              />
            )}
          />
          {errors.pin && (
            <Text style={[styles.errorText, { color: colors.danger, marginTop: spacing.xs }]}>
              {errors.pin.message}
            </Text>
          )}
        </View>

        {/* Bouton Principal (Primary) */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.buttonPrimary,
              borderRadius: radius.md,
              paddingVertical: spacing.md,
              marginBottom: spacing.md,
            }
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.buttonPrimaryText} />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.buttonPrimaryText }]}>
              Déverrouiller
            </Text>
          )}
        </TouchableOpacity>

        {/* Bouton Secondaire Biométrie */}
        <TouchableOpacity 
          style={[styles.biometricButton, { paddingVertical: spacing.sm }]}
          onPress={() => Alert.alert('Biométrie', 'FaceID / TouchID bientôt disponible.')}
        >
          <Text style={[styles.biometricText, { color: colors.primary }]}>
            Utiliser la biométrie
          </Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UnlockVaultScreen;
