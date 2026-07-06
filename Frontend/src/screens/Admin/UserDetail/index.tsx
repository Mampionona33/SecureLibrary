import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '@services/userService';
import { UserResponse } from '@types/user';
import { styles } from './styles';

const UserDetailScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchUserDetails = async () => {
    try {
      const data = await userService.getUserById(userId);
      setUser(data);
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

  const handleStatusChange = async (newStatus: 'active' | 'pending' | 'suspended') => {
    if (user?.status === newStatus) return;
    
    try {
      setUpdating(true);
      await userService.changeUserStatus(userId, newStatus);
      Alert.alert('Succès', `Le statut a été configuré sur : ${newStatus}`);
      await fetchUserDetails();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de modifier le statut.');
    } finally {
      setUpdating(false);
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
          <Text style={styles.title}>Fiche Membre</Text>
          <TouchableOpacity
            style={{ backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 }}
            onPress={() => navigation.navigate('UserEdit', { userId })}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>Éditer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Prénom / Nom</Text>
          <Text style={styles.value}>{user?.firstName} {user?.lastName}</Text>

          <Text style={styles.label}>Adresse Email</Text>
          <Text style={styles.value}>{user?.email}</Text>

          <Text style={styles.label}>Rôle système</Text>
          <Text style={styles.valueBadge}>{user?.role}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Ajuster le statut d'accès</Text>
          {updating ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 12 }} />
          ) : (
            <View style={styles.pickerRow}>
              {(['active', 'pending', 'suspended'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pickerButton, user?.status === s && styles.pickerButtonActive]}
                  onPress={() => handleStatusChange(s)}
                >
                  <Text style={[styles.pickerText, user?.status === s && styles.pickerTextActive]}>
                    {s === 'active' ? 'Actif' : s === 'pending' ? 'Attente' : 'Bloqué'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDetailScreen;
