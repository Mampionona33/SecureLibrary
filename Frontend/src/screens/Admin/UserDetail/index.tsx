import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '@services/userService';
import { UserResponse } from '@types/user';
import { styles } from './styles';

const UserDetailScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'reader'>('reader');
  const [status, setStatus] = useState<'active' | 'pending' | 'suspended'>('pending');

  const fetchUserDetails = async () => {
    try {
      const data = await userService.getUserById(userId);
      setUser(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setRole(data.role);
      setStatus(data.status);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de charger les détails.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await userService.changeUserStatus(userId, status); 
      Alert.alert('Succès', 'Le profil a été mis à jour.');
      setIsEditing(false);
      fetchUserDetails();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder.');
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEditing ? 'Éditer le membre' : 'Détails du membre'}</Text>
          <TouchableOpacity
            style={[styles.modeButton, isEditing ? styles.cancelButton : styles.editButton]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.modeButtonText}>{isEditing ? 'Annuler' : 'Modifier'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Prénom</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              editable={false}
            />
          ) : (
            <Text style={styles.value}>{user?.firstName}</Text>
          )}

          <Text style={styles.label}>Nom</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              editable={false}
            />
          ) : (
            <Text style={styles.value}>{user?.lastName}</Text>
          )}

          <Text style={styles.label}>Adresse Email</Text>
          <Text style={styles.valueDisabled}>{user?.email}</Text>

          <Text style={styles.label}>Rôle</Text>
          {isEditing ? (
            <View style={styles.pickerRow}>
              {(['reader', 'staff', 'admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.pickerButton, role === r && styles.pickerButtonActive]}
                  onPress={() => setRole(r)}
                  disabled={true}
                >
                  <Text style={[styles.pickerText, role === r && styles.pickerTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.valueBadge}>{user?.role}</Text>
          )}

          <Text style={styles.label}>Statut</Text>
          {isEditing ? (
            <View style={styles.pickerRow}>
              {(['active', 'pending', 'suspended'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pickerButton, status === s && styles.pickerButtonActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.pickerText, status === s && styles.pickerTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.valueBadge}>{user?.status}</Text>
          )}
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDetailScreen;
