import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Intercepteur de Requête : Ajoute le token d'accès extrait du JSON de session
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'user_session' });
      if (credentials && credentials.password) {
        const session = JSON.parse(credentials.password);
        if (session && session.access) {
          config.headers.Authorization = `Bearer ${session.access}`;
        }
      }
    } catch (error) {
      console.error('[Interceptor Request] Erreur lecture Keychain:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Intercepteur de Réponse : Gère l'expiration (401) et rafraîchit automatiquement via le JSON de session
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const credentials = await Keychain.getGenericPassword({ service: 'user_session' });
        if (credentials && credentials.password) {
          const session = JSON.parse(credentials.password);
          
          if (!session || !session.refresh) {
            throw new Error('No refresh token available in session structure');
          }

          // Appel à l'API Django pour obtenir un nouvel access token
          const response = await axios.post(`${API_URL}/users/token/refresh/`, {
            refresh: session.refresh,
          });

          const newAccessToken = response.data.access;

          // Mise à jour de la session unifiée dans le Keychain
          const updatedSession = {
            access: newAccessToken,
            refresh: session.refresh,
          };
          await Keychain.setGenericPassword('secure_library', JSON.stringify(updatedSession), { service: 'user_session' });

          // Rejeu de la requête initiale en échec avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // En cas d'échec critique du refresh (ex: refresh token expiré), on nettoie tout
        await Keychain.resetGenericPassword({ service: 'user_session' });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
