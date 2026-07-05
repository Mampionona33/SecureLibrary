import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useVault } from '@context/VaultContext';
import { useAuth } from '@context/AuthContext';

import SecurityStack from './SecurityStack';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator'; // Import de notre tiroir custom

const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isVaultConfigured, isVaultUnlocked, isLoadingVault } = useVault();
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingVault || isLoadingAuth) {
    return null; 
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* CONDITION 1 : Priorité absolue à la sécurité locale (Pas de menu) */}
        {(!isVaultConfigured || !isVaultUnlocked) ? (
          <RootStack.Screen name="SecurityStack" component={SecurityStack} />
        ) 
        
        /* CONDITION 2 : Le coffre est ouvert, pas encore connecté (Pas de menu) */
        : !isAuthenticated ? (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        ) 
        
        /* CONDITION 3 : Connecté et validé (Menu Tiroir Actif) */
        : (
          <RootStack.Screen name="AppDrawer" component={DrawerNavigator} />
        )}

      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
