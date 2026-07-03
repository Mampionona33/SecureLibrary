import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Remplacez 'username' par 'email' si votre backend Django est configuré 
  // pour s'authentifier avec l'email.
  login: async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/api/token/', {
        username,
        password,
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
      // On supprime les tokens locaux
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  },
};
