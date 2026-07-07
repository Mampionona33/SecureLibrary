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
import { createUserSchema } from './schema';
import { styles } from './styles';

export default function CreateUserScreen({ navigation }: any) {
  const fetchUsers = useUserStore((state) => state.fetchUsers);
 
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nouveau Membre</Text>

        {apiError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={[styles.input, fieldErrors.firstName && styles.inputError]}
              placeholder="Ex: Jean"
              placeholderTextColor="#94a3b8"
              value={firstName}
              onChangeText={setFirstName}
            />
            {fieldErrors.firstName && (
              <Text style={styles.fieldErrorText}>{fieldErrors.firstName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de famille</Text>
            <TextInput
              style={[styles.input, fieldErrors.lastName && styles.inputError]}
              placeholder="Ex: Dupont"
              placeholderTextColor="#94a3b8"
              value={lastName}
              onChangeText={setLastName}
            />
            {fieldErrors.lastName && (
              <Text style={styles.fieldErrorText}>{fieldErrors.lastName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse Email</Text>
            <TextInput
              style={[styles.input, fieldErrors.email && styles.inputError]}
              placeholder="adresse@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {fieldErrors.email && (
              <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe initial</Text>
            <TextInput
              style={[styles.input, fieldErrors.password && styles.inputError]}
              placeholder="••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />
            {fieldErrors.password && (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rôle au sein de l'organisation</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[styles.pickerButton, role === 'reader' && styles.activePickerButton]}
                onPress={() => setRole('reader')}
              >
                <Text style={[styles.pickerButtonText, role === 'reader' && styles.activePickerButtonText]}>
                  Lecteur
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickerButton, role === 'staff' && styles.activePickerButton]}
                onPress={() => setRole('staff')}
              >
                <Text style={[styles.pickerButtonText, role === 'staff' && styles.activePickerButtonText]}>
                  Personnel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickerButton, role === 'admin' && styles.activePickerButton]}
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.pickerButtonText, role === 'admin' && styles.activePickerButtonText]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Ajouter le membre</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
