import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DevToolsBubble } from 'react-native-react-query-devtools';
import { Platform, Alert, View } from 'react-native';

// Import de nos Contextes
import { VaultProvider } from './src/context/VaultContext';
import { AuthProvider } from './src/context/AuthContext';

// Import de la Navigation
import AppNavigator from './src/navigation/AppNavigator';

// ✅ Import du gestionnaire réseau
import { NetworkManager } from '@utils/networkUtils';

// ✅ Configuration de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// ✅ Fonction pour le copier-coller (requis par DevToolsBubble)
const handleCopy = (text: string) => {
  if (Platform.OS === 'web') {
    navigator.clipboard?.writeText(text);
  } else {
    Alert.alert('📋 Copié', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
  }
};

const App = () => {
  // ✅ Initialiser le monitoring réseau au démarrage
  useEffect(() => {
    console.log('📱 Initialisation de l\'application...');
    
    // Démarrer le monitoring réseau
    const unsubscribe = NetworkManager.initialize();
    
    // Vérifier la connexion initiale
    NetworkManager.checkConnection().then(isConnected => {
      console.log(`📡 Connexion initiale: ${isConnected ? '🟢 En ligne' : '🔴 Hors-ligne'}`);
    });
    
    // ✅ Nettoyer à la fermeture
    return () => {
      console.log('📱 Fermeture de l\'application');
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <VaultProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </VaultProvider>
      </SafeAreaProvider>
      
      {/* 🔥 DevTools React Query - Visible uniquement en développement */}
      {__DEV__ && (
        <DevToolsBubble
          onCopy={handleCopy}
          position="bottom-right"
          networkToggle={true}
          silent={false}
        />
      )}
    </QueryClientProvider>
  );
};

export default App;
