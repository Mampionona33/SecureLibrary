import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import de nos Contextes (Vérifie bien les alias ou chemins relatifs)
import { VaultProvider } from './src/context/VaultContext';
import { AuthProvider } from './src/context/AuthContext';

// Import de la Navigation
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </VaultProvider>
    </SafeAreaProvider>
  );
};

export default App;
