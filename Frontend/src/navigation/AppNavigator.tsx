import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useVault } from '@context/VaultContext';
import { useAuth } from '@context/AuthContext';

import SecurityStack from './SecurityStack';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import AdminStack from './AdminStack';

const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isVaultConfigured, isVaultUnlocked, isLoadingVault } = useVault();
  const { isAuthenticated, isStaff, isLoadingAuth } = useAuth();

  // On attend que les vérifications mémoires (Keychain/Tokens) soient finies
  if (isLoadingVault || isLoadingAuth) {
    return null; 
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* CONDITION 1 : Priorité absolue à la sécurité locale */}
        {(!isVaultConfigured || !isVaultUnlocked) ? (
          <RootStack.Screen name="SecurityStack" component={SecurityStack} />
        ) 
        
        /* CONDITION 2 : Le coffre est ouvert, on gère l'accès serveur */
        : !isAuthenticated ? (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        ) 
        
        /* CONDITION 3 : L'utilisateur est connecté et validé */
        : isStaff ? (
          <RootStack.Screen name="AdminStack" component={AdminStack} />
        ) : (
          <RootStack.Screen name="MainStack" component={MainStack} />
        )}

      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
