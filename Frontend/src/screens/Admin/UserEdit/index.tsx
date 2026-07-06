import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '@services/userService';
import { styles } from './styles';

const UserEditScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'reader'>('reader');
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended'>('pending');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getUserById(userId);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setRole(data.role);
        setStatus(data.status);
      } catch (error: any) {
        Alert.alert('Erreur', 'Impossible de charger les données du membre.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setSaving(true);
      
      // Ici, on met à jour le statut, et si ton API évolue, tu passeras aussi firstName, lastName, etc.
      await userService.changeUserStatus(userId, status); 
      
      Alert.alert('Succès', 'Le profil a été mis à jour avec succès.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Modifier les informations</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Prénom *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Prénom"
          />

          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Nom de famille"
          />

          <Text style={styles.label}>Adresse Email *</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />

          <Text style={styles.label}>Rôle au sein de la bibliothèque</Text>
          <View style={styles.pickerRow}>
            {(['reader', 'staff', 'admin'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.pickerButton, role === r && styles.pickerButtonActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.pickerText, role === r && styles.pickerTextActive]}>
                  {r === 'reader' ? 'Lecteur' : r === 'staff' ? 'Staff' : 'Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Statut du compte</Text>
          <View style={styles.pickerRow}>
            {(['active', 'pending', 'suspended'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.pickerButton, status === s && styles.pickerButtonActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.pickerText, status === s && styles.pickerTextActive]}>
                  {s === 'active' ? 'Actif' : s === 'pending' ? 'Attente' : 'Bloqué'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, saving && styles.disabledButton]} 
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserEditScreen;
