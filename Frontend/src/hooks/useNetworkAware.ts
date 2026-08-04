import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '@store/useAuthStore';
import { useBookStore } from '@store/useBookStore';
import { NetworkManager } from '@utils/networkUtils';

export const useNetworkAware = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  
  const { isAuthenticated, restoreSession } = useAuthStore();
  const { fetchBooks, fetchActiveBooks, books, localBooks } = useBookStore();

  // ✅ 1. Initialiser le monitoring
  useEffect(() => {
    // Vérifier la connexion initiale
    NetworkManager.checkConnection().then(connected => {
      setIsOnline(connected);
    });

    // Écouter les changements
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsOnline(connected);
      setConnectionType(state.type || 'unknown');
      
      console.log(`📡 Réseau ${connected ? '🟢 en ligne' : '🔴 hors-ligne'}`);
      
      // ✅ 3. Reconnexion automatique
      if (connected && isAuthenticated) {
        handleReconnect();
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // ✅ 3. Fonction de reconnexion
  const handleReconnect = async () => {
    console.log('🔄 Reconnexion réseau - Refresh...');
    
    try {
      // Restaurer la session
      await restoreSession();
      
      // Recharger les livres
      await fetchBooks();
      
      console.log('✅ Refresh terminé');
    } catch (error) {
      console.error('❌ Erreur refresh:', error);
    }
  };

  // ✅ 2. Vérifier si un livre est disponible hors-ligne
  const isBookAvailableOffline = (bookId: string): boolean => {
    return localBooks.has(bookId);
  };

  // ✅ 2. Obtenir les livres disponibles hors-ligne
  const getOfflineBooks = () => {
    return books.filter(book => localBooks.has(book.id));
  };

  return {
    isOnline,
    connectionType,
    isBookAvailableOffline,
    getOfflineBooks,
    handleReconnect,
  };
};
