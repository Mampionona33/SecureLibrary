import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { styles } from './styles';
import axios from 'axios';
import { API_URL } from '@env';

const PendingApprovalScreen = () => {
  const { user, setUser, logout, authToken } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);

  const handleRefreshStatus = async () => {
    setIsChecking(true);
    try {
      const response = await axios.get(`${API_URL}/users/me/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      setLastCheckedAt(new Date());

      if (response.status === 200) {
        setUser(response.data.user);
        
        if (response.data.user.status === 'active') {
          Alert.alert("Félicitations !", "Votre compte a été approuvé.");
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de joindre le serveur de sécurité.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.card}>
          <Text style={styles.icon}>⏳</Text>
          <Text style={styles.title}>Accès en attente</Text>
          <Text style={styles.subtitle}>
            Votre inscription a bien été enregistrée. Pour des raisons de sécurité, 
            un administrateur doit valider manuellement votre compte avant que vous 
            puissiez accéder à la bibliothèque chiffrée.
          </Text>

          {lastCheckedAt && (
            <View style={styles.statusBadge}>
              <Text style={styles.lastChecked}>
                ✓ Vérifié à {lastCheckedAt.toLocaleTimeString()} (Toujours en attente)
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.refreshButton, isChecking && styles.disabledButton]}
            onPress={handleRefreshStatus}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.refreshButtonText}>🔄 Vérifier à nouveau</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={logout}
            disabled={isChecking}
          >
            <Text style={styles.logoutButtonText}>🚪 Retour au Login</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default PendingApprovalScreen;
