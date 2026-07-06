import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@store/useUserStore';
import { userService } from '@services/userService';
import { UserResponse } from '@types/user';
import { styles } from './styles';

const UserDetailScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  
  // 1. Essayer de récupérer l'utilisateur depuis le store global
  const storeUser = useUserStore((state) => 
    state.users.find((u) => u.id.toString() === userId.toString())
  );
  
  const [user, setUser] = useState<UserResponse | undefined>(storeUser);
  const [localLoading, setLocalLoading] = useState<boolean>(!storeUser);

  // 2. Sécurité : Si l'utilisateur n'est pas dans le store, on va le chercher directement sur le serveur
  useEffect(() => {
    if (!storeUser) {
      const fetchBackupUser = async () => {
        try {
          setLocalLoading(true);
          const data = await userService.getUserById(userId);
          setUser(data);
        } catch (error: any) {
          Alert.alert('Erreur', 'Impossible de charger les détails de ce membre.');
          navigation.goBack();
        } finally {
          setLocalLoading(false);
        }
      };
      fetchBackupUser();
    } else {
      setUser(storeUser);
    }
  }, [userId, storeUser]);

  if (localLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Utilisateur introuvable ({userId}).</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Détails du Membre</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Prénom :</Text>
            <Text style={styles.value}>{user.firstName || 'Non renseigné'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Nom :</Text>
            <Text style={styles.value}>{user.lastName || 'Non renseigné'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email :</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Rôle :</Text>
            <Text style={[styles.badge, styles[`role_${user.role}`]]}>
              {user.role === 'admin' ? 'Administrateur' : user.role === 'staff' ? 'Personnel' : 'Lecteur'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Statut :</Text>
            <Text style={[styles.badge, styles[`status_${user.status}`]]}>
              {user.status === 'active' ? 'Actif' : user.status === 'pending' ? 'En attente' : 'Bloqué'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Groupes :</Text>
            <Text style={styles.value}>
              {user.groups_list && user.groups_list.length > 0
                ? user.groups_list.map((g: any) => g.name).join(', ')
                : 'Aucun groupe'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('UserEdit', { userId: user.id })}
        >
          <Text style={styles.editButtonText}>Modifier le profil</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDetailScreen;
