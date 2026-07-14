import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import PendingApprovalScreen from '../screens/Auth/PendingApproval';

export const RootStack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isVaultConfigured, isVaultUnlocked, isLoadingVault } = useVault();

  const { isAuthenticated, isPendingApproval, isLoadingAuth } = useAuth();

  const { isDark } = useAppTheme();

  const navigationTheme = isDark ? navigationDarkTheme : navigationLightTheme;

  if (isLoadingVault || isLoadingAuth) {
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isVaultConfigured || !isVaultUnlocked ? (
          <RootStack.Screen name="SecurityStack" component={SecurityStack} />
        ) : isPendingApproval ? (
          <RootStack.Screen
            name="PendingApproval"
            component={PendingApprovalScreen}
          />
        ) : !isAuthenticated ? (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        ) : (
          <RootStack.Screen name="AppDrawer" component={DrawerNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
