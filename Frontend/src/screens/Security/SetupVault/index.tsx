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

import { setupVaultSchema, SetupVaultFormType } from './schema';
import { styles } from './styles';
import { useVault } from '@context/VaultContext';
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Import du thème

const SetupVaultScreen = () => {
  const { setupLocalVault } = useVault();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🟢 Extraction dynamique du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

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
    setIsSubmitting(true);
    try {
      await setupLocalVault(data.pin);
      console.log('Coffre configuré avec le PIN :', data.pin);
      Alert.alert('Succès', 'Votre coffre local est sécurisé !');
    } catch (error) {
      console.error("Erreur lors de la configuration du coffre :", error);
      Alert.alert('Erreur', 'Impossible de configurer le coffre local.');
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
          <Text style={styles.icon}>🛡️</Text>
        </View>

        <Text style={[styles.title, { color: colors.text, marginBottom: spacing.xs }]}>
          Sécurité Locale
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
          Créez un code PIN à 4 chiffres pour protéger vos données hors ligne.
        </Text>

        {/* Premier Champ : PIN */}
        <View style={[styles.inputContainer, { marginBottom: spacing.md }]}>
          <Text style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}>
            Nouveau code PIN
          </Text>
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
                  errors.pin && { borderColor: colors.danger }
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
              />
            )}
          />
          {errors.pin && (
            <Text style={[styles.errorText, { color: colors.danger, marginTop: spacing.xs }]}>
              {errors.pin.message}
            </Text>
          )}
        </View>

        {/* Deuxième Champ : Confirmation PIN */}
        <View style={[styles.inputContainer, { marginBottom: spacing.lg }]}>
          <Text style={[styles.label, { color: colors.text, marginBottom: spacing.xs }]}>
            Confirmer le code PIN
          </Text>
          <Controller
            control={control}
            name="confirmPin"
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
                  errors.confirmPin && { borderColor: colors.danger }
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
              />
            )}
          />
          {errors.confirmPin && (
            <Text style={[styles.errorText, { color: colors.danger, marginTop: spacing.xs }]}>
              {errors.confirmPin.message}
            </Text>
          )}
        </View>

        {/* Bouton de validation */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.buttonPrimary,
              borderRadius: radius.md,
              paddingVertical: spacing.md,
              marginTop: spacing.sm,
            },
            isSubmitting && { opacity: 0.6 }
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.buttonPrimaryText} />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.buttonPrimaryText }]}>
              Sécuriser mon accès
            </Text>
          )}
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SetupVaultScreen;
