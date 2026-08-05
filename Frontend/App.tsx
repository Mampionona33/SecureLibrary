import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onlineManager } from '@tanstack/react-query';

import { VaultProvider } from './src/context/VaultContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NetworkManager } from '@utils/networkUtils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  React.useEffect(() => {
    const unsubscribe = NetworkManager.initialize();
    return () => unsubscribe();
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
    </QueryClientProvider>
  );
};

export default App;
