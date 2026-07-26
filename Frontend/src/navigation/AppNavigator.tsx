import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
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

export const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isVaultConfigured, isVaultUnlocked, isLoadingVault } = useVault();
  const { isAuthenticated, isPendingApproval, isLoadingAuth } = useAuth();
  const { isDark } = useAppTheme();

  const navigationTheme = isDark ? navigationDarkTheme : navigationLightTheme;
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Vérifier la connexion internet
      const netInfo = await NetInfo.fetch();
      setIsOnline(netInfo.isConnected ?? true);
      setIsReady(true);
    };
    init();

    // Écouter les changements de connexion
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  if (!isReady || isLoadingVault || isLoadingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  console.log('📡 Mode:', isOnline ? 'En ligne' : 'Hors-ligne');
  console.log('✅ Auth:', isAuthenticated);

  return (
    <NavigationContainer theme={navigationTheme} ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isVaultConfigured || !isVaultUnlocked ? (
          <RootStack.Screen name="SecurityStack" component={SecurityStack} />
        ) : isPendingApproval ? (
          <RootStack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        ) : !isAuthenticated ? (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        ) : !isOnline ? (
          <RootStack.Screen name="Home" component={HomeScreen} />
        ) : (
          <RootStack.Screen name="AppDrawer" component={DrawerNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
