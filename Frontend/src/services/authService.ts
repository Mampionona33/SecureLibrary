import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // On renomme le paramètre 'username' en 'email' pour être plus clair
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/token/', {
        email: email,       // <--- LA CORRECTION EST ICI (email au lieu de username)
        password: password,
      });

      // Sauvegarde des tokens
      await AsyncStorage.setItem('accessToken', response.data.access);
      await AsyncStorage.setItem('refreshToken', response.data.refresh);

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  },
};
