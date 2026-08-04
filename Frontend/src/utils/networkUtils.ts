import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '@store/useAuthStore';
import { useBookStore } from '@store/useBookStore';
import { onlineManager } from '@tanstack/react-query';

export const NetworkManager = {
  // ✅ État réseau actuel
  isOnline: true,

  // ✅ Initialiser le monitoring réseau
  initialize: () => {
    // Écouter les changements de connexion
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      NetworkManager.isOnline = isConnected;
      
      console.log(`📡 Réseau: ${isConnected ? '🟢 En ligne' : '🔴 Hors-ligne'}`);
      
      // ✅ 1. Mettre à jour onlineManager de React Query
      onlineManager.setOnline(isConnected);
      
      // ✅ 2. Si connexion rétablie, refresh automatique
      if (isConnected) {
        NetworkManager.handleReconnect();
      }
    });

    return unsubscribe;
  },

  // ✅ 3. Gérer la reconnexion
  handleReconnect: async () => {
    console.log('🔄 Connexion rétablie - Refresh automatique...');
    
    try {
      const { isAuthenticated, restoreSession } = useAuthStore.getState();
      
      // ✅ Si l'utilisateur est authentifié, restaurer la session
      if (isAuthenticated) {
        await restoreSession();
        console.log('✅ Session restaurée après reconnexion');
      }
      
      // ✅ Recharger les livres
      const { fetchBooks } = useBookStore.getState();
      await fetchBooks();
      console.log('✅ Livres rechargés après reconnexion');
      
    } catch (error) {
      console.error('❌ Erreur lors de la reconnexion:', error);
    }
  },

  // ✅ Vérifier l'état réseau actuel
  checkConnection: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected ?? false;
    NetworkManager.isOnline = isConnected;
    return isConnected;
  },

  // ✅ Obtenir le type de connexion
  getConnectionType: async (): Promise<string> => {
    const state = await NetInfo.fetch();
    return state.type || 'unknown';
  },
};
