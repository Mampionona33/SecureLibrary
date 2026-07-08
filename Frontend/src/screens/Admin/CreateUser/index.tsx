import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as v from 'valibot';

import { useUserStore } from '@store/useUserStore';
import { userService } from '@services/userService';
import { useAppTheme } from '@theme/useAppTheme'; // 🟢 Importation du thème
import { createUserSchema } from './schema';
import { styles } from './styles';

export default function CreateUserScreen({ navigation }: any) {
  const fetchUsers = useUserStore((state) => state.fetchUsers);

  // 🟢 Extraction dynamique des variables du thème
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'reader'>('reader');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string>('');

  const handleCreate = async () => {
    setFieldErrors({});
    setApiError('');

    const formData = {
      firstName,
      lastName,
      email,
      password,
      role,
    };

    setLoading(true);

    try {
      const result = v.safeParse(createUserSchema, formData);

      if (!result.success) {
        setLoading(false);
        const errors: { [key: string]: string } = {};
        result.issues.forEach((issue: any) => {
          if (issue.path && issue.path[0]) {
            const fieldName = issue.path[0].key;
            errors[fieldName] = issue.message;
          }
        });
        setFieldErrors(errors);
        return;
      }

      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
        status: 'active',
      };

      await userService.createUser(payload);
      await fetchUsers(true);

      setLoading(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('reader');

      setTimeout(() => {
        Alert.alert('Succès', 'Le nouveau membre a été créé avec succès.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }, 300);

    } catch (error: any) {
      setLoading(false);
      setApiError(error.message || 'Impossible de créer le membre.');

      setTimeout(() => {
        Alert.alert('Erreur', error.message || 'Impossible de créer le membre.');
      }, 300);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text, marginBottom: spacing.lg }]}>Nouveau Membre</Text>

        {/* Bannière d'erreur API */}
        {apiError && (
          <View style={[
            styles.errorBanner, 
            { 
              backgroundColor: colors.danger + '20', // Opacité légère
              borderLeftColor: colors.danger,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.md
            }
          ]}>
            <Text style={[styles.errorBannerText, { color: colors.danger }]}>{apiError}</Text>
          </View>
        )}

        {/* Carte de Formulaire */}
        <View style={[
          styles.formCard, 
          { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.xl
          }
        ]}>
          
          {/* Prénom */}
          <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Prénom</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: fieldErrors.firstName ? colors.danger : colors.inputBorder,
                  color: colors.text,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.md
                },
                fieldErrors.firstName && { backgroundColor: colors.danger + '10' }
              ]}
              placeholder="Ex: Jean"
              placeholderTextColor={colors.placeholder}
              value={firstName}
              onChangeText={setFirstName}
            />
            {fieldErrors.firstName && (
              <Text style={[styles.fieldErrorText, { color: colors.danger, marginTop: spacing.xs }]}>{fieldErrors.firstName}</Text>
            )}
          </View>

          {/* Nom de famille */}
          <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Nom de famille</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: fieldErrors.lastName ? colors.danger : colors.inputBorder,
                  color: colors.text,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.md
                },
                fieldErrors.lastName && { backgroundColor: colors.danger + '10' }
              ]}
              placeholder="Ex: Dupont"
              placeholderTextColor={colors.placeholder}
              value={lastName}
              onChangeText={setLastName}
            />
            {fieldErrors.lastName && (
              <Text style={[styles.fieldErrorText, { color: colors.danger, marginTop: spacing.xs }]}>{fieldErrors.lastName}</Text>
            )}
          </View>

          {/* Adresse Email */}
          <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Adresse Email</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: fieldErrors.email ? colors.danger : colors.inputBorder,
                  color: colors.text,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.md
                },
                fieldErrors.email && { backgroundColor: colors.danger + '10' }
              ]}
              placeholder="adresse@email.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {fieldErrors.email && (
              <Text style={[styles.fieldErrorText, { color: colors.danger, marginTop: spacing.xs }]}>{fieldErrors.email}</Text>
            )}
          </View>

          {/* Mot de passe */}
          <View style={[styles.inputGroup, { marginBottom: spacing.md }]}>
            <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Mot de passe initial</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: fieldErrors.password ? colors.danger : colors.inputBorder,
                  color: colors.text,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.md
                },
                fieldErrors.password && { backgroundColor: colors.danger + '10' }
              ]}
              placeholder="••••••"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />
            {fieldErrors.password && (
              <Text style={[styles.fieldErrorText, { color: colors.danger, marginTop: spacing.xs }]}>{fieldErrors.password}</Text>
            )}
          </View>

          {/* Sélecteur de rôle */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Rôle au sein de l'organisation</Text>
            <View style={[styles.pickerContainer, { gap: spacing.xs }]}>
              {(['reader', 'staff', 'admin'] as const).map((r) => {
                const isActive = role === r;
                const labels = { reader: 'Lecteur', staff: 'Personnel', admin: 'Admin' };
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.pickerButton,
                      {
                        backgroundColor: isActive ? colors.primary : colors.inputBackground,
                        borderColor: isActive ? colors.primary : colors.inputBorder,
                        borderRadius: radius.md,
                        paddingVertical: spacing.sm
                      }
                    ]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[
                      styles.pickerButtonText,
                      { color: isActive ? colors.buttonPrimaryText : colors.textSecondary }
                    ]}>
                      {labels[r]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Bouton de Soumission */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: colors.buttonPrimary, 
              borderRadius: radius.md,
              height: 48 
            },
            loading && { backgroundColor: colors.disabled, shadowOpacity: 0, elevation: 0 }
          ]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.buttonPrimaryText} />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.buttonPrimaryText }]}>Ajouter le membre</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
