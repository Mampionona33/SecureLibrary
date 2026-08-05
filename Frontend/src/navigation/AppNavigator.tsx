import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Alert, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { useVault } from '@context/VaultContext';
import { useAuth } from '@context/AuthContext';
import { useAppTheme } from '@theme/useAppTheme';
import {
  navigationLightTheme,
  navigationDarkTheme,
} from '@theme/navigationTheme';

import SecurityStack from './SecurityStack';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator';
import HomeScreen from '@screens/Home';
import PendingApprovalScreen from '../screens/Auth/PendingApproval';
import { navigationRef } from './NavigationService';
import { useAuthStore } from '@store/useAuthStore'; // ✅ Ajouter

export const RootStack = createNativeStackNavigator();

// ✅ Écran de chargement personnalisé
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
    <ActivityIndicator size="large" color="#3b82f6" />
    <Text style={{ marginTop: 12, color: '#64748b', fontSize: 16 }}>
      Chargement...
    </Text>
  </View>
);

// ✅ Écran hors-ligne (optionnel)
const OfflineScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 }}>
    <Text style={{ fontSize: 48, marginBottom: 16 }}>📡</Text>
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 }}>
      Mode hors-ligne
    </Text>
    <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center' }}>
      Vous êtes hors-ligne. Les données locales sont disponibles.
    </Text>
  </View>
);

const AppNavigator = () => {
  const { isVaultConfigured, isVaultUnlocked, isLoadingVault } = useVault();
  const { isAuthenticated, isPendingApproval, isLoadingAuth } = useAuth();
  const { isDark } = useAppTheme();

  // ✅ Récupérer restoreSession depuis le store
  const { restoreSession } = useAuthStore();

  const navigationTheme = isDark ? navigationDarkTheme : navigationLightTheme;
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineAlertShown, setOfflineAlertShown] = useState(false);
  const [isSessionRestored, setIsSessionRestored] = useState(false);

  // ✅ Restaurer la session au démarrage
  useEffect(() => {
    const restore = async () => {
      try {
        console.log('🔄 [AppNavigator] Restauration de la session...');
        const restored = await restoreSession();
        setIsSessionRestored(true);
        console.log('🔄 [AppNavigator] Session restaurée:', restored);
        
        // ✅ Vérifier l'état après restauration
        const state = useAuthStore.getState();
        console.log('📱 [AppNavigator] État après restauration:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user?.email,
          authToken: state.authToken ? '✅ présent' : '❌ absent',
        });
      } catch (error) {
        console.error('❌ [AppNavigator] Erreur restauration:', error);
        setIsSessionRestored(true);
      }
    };
    restore();
  }, []);

  // ✅ Initialisation réseau
  useEffect(() => {
    const init = async () => {
      try {
        const netInfo = await NetInfo.fetch();
        const connected = netInfo.isConnected ?? true;
        setIsOnline(connected);
        
        if (!connected) {
          console.log('🔴 Mode hors-ligne - Utilisation des données locales');
          if (!offlineAlertShown) {
            setOfflineAlertShown(true);
          }
        }
      } catch (error) {
        console.error('❌ Erreur initialisation réseau:', error);
      } finally {
        setIsReady(true);
      }
    };
    init();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? true;
      setIsOnline(connected);
      
      if (connected) {
        console.log('🟢 Connexion rétablie - Refresh automatique...');
        handleReconnect();
        setOfflineAlertShown(false);
      } else {
        console.log('🔴 Connexion perdue - Mode hors-ligne');
        if (!offlineAlertShown) {
          setOfflineAlertShown(true);
        }
      }
    });

    return () => {
      unsubscribe();
      setOfflineAlertShown(false);
    };
  }, []);

  // ✅ Gérer la reconnexion automatique avec restauration de session
  const handleReconnect = async () => {
    try {
      console.log('🔄 [AppNavigator] Reconnexion - Restauration...');
      
      // ✅ Restaurer la session
      const restored = await restoreSession();
      
      if (restored) {
        console.log('✅ [AppNavigator] Session restaurée après reconnexion');
        
        // ✅ Recharger les données si nécessaire
        // const { fetchBooks } = useBookStore.getState();
        // await fetchBooks();
      } else {
        console.log('⚠️ [AppNavigator] Échec de la restauration après reconnexion');
      }
    } catch (error) {
      console.error('❌ [AppNavigator] Erreur reconnexion:', error);
    }
  };

  // ✅ Écrans de chargement
  if (!isReady || isLoadingVault || isLoadingAuth || !isSessionRestored) {
    return <LoadingScreen />;
  }

  console.log('========================================');
  console.log('📱 NAVIGATION STATE');
  console.log('📡 Réseau:', isOnline ? '🟢 En ligne' : '🔴 Hors-ligne');
  console.log('🔐 Authentifié:', isAuthenticated);
  console.log('🏦 Vault:', isVaultConfigured && isVaultUnlocked ? '✅ Déverrouillé' : '🔒 Verrouillé');
  console.log('⏳ Pending:', isPendingApproval);
  console.log('========================================');

  return (
    <NavigationContainer theme={navigationTheme} ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* 1. Vault non configuré ou non déverrouillé */}
        {!isVaultConfigured || !isVaultUnlocked ? (
          <RootStack.Screen name="SecurityStack" component={SecurityStack} />
        ) : 
        /* 2. En attente d'approbation */
        isPendingApproval ? (
          <RootStack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        ) : 
        /* 3. Non authentifié */
        !isAuthenticated ? (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        ) : 
        /* 4. ✅ AUTHENTIFIÉ - Rediriger vers Drawer (même hors-ligne) */
        (
          <RootStack.Screen name="AppDrawer" component={DrawerNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
