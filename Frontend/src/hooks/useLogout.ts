import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

export const useLogout = () => {
  const { logout, isLoading } = useAuthStore();
  const navigation = useNavigation();

  const handleLogout = useCallback(async () => {
    // ✅ Si déjà en cours de déconnexion, ne rien faire
    if (isLoading) {
      console.log('⚠️ Déconnexion déjà en cours');
      return;
    }

    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { 
          text: 'Annuler', 
          style: 'cancel' 
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // ✅ La navigation est automatique via AppNavigator
              console.log('✅ Déconnexion réussie');
            } catch (error) {
              console.error('❌ Erreur déconnexion:', error);
              Alert.alert(
                'Erreur',
                'Impossible de se déconnecter. Veuillez réessayer.'
              );
            }
          },
        },
      ]
    );
  }, [logout, isLoading]);

  return { logout: handleLogout, isLoggingOut: isLoading };
};
