import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../context/AuthContext';
import { styles } from './styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'PendingApproval'>;

const PendingApprovalScreen = ({ route, navigation }: Props) => {
  const { login } = useAuth();
  const { email, password } = route.params;
  
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);

  const handleRefreshStatus = async () => {
    setIsChecking(true);
    try {
      // 🔄 On retente simplement un login classique en tâche de fond avec les identifiants reçus
      const result = await login(email, password || '');

      // Met à jour l'heure système de la tentative
      setLastCheckedAt(new Date());

      if (result.success) {
        // Si le compte a été validé par l'admin : success devient true dans AuthContext,
        // isAuthenticated passe à true, et AppNavigator démonte automatiquement toute l'AuthStack !
      } else {
        // Si Django répond toujours 400 "en attente...", c'est que rien n'a changé.
        // Option choisie : aucune alerte intrusive, le badge de statut se met à jour visuellement.
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

          {/* Indicateur visuel du statut sans alerte pop-up */}
          {lastCheckedAt && (
            <View style={styles.statusBadge}>
              <Text style={styles.lastChecked}>
                ✓ Vérifié à {lastCheckedAt.toLocaleTimeString()} (Toujours en attente)
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {/* Bouton pour relancer la vérification */}
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

          {/* Bouton de retour sécurisé (démonte la page et retourne au Login initial) */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={() => navigation.navigate('Login')}
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
