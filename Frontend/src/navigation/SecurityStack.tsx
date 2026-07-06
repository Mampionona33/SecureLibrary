import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useVault } from '@context/VaultContext';
import { SecurityStackParamList } from './types';

import SetupVaultScreen from '@screens/Security/SetupVault';
import UnlockVaultScreen from '@screens/Security/UnlockVault';

const Stack = createNativeStackNavigator<SecurityStackParamList>();

const SecurityStack = () => {
  const { isVaultConfigured } = useVault();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isVaultConfigured ? (
        <Stack.Screen name="SetupVault" component={SetupVaultScreen} />
      ) : (
        <Stack.Screen name="UnlockVault" component={UnlockVaultScreen} />
      )}
    </Stack.Navigator>
  );
};

export default SecurityStack;
