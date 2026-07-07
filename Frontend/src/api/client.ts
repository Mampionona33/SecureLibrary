import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Intercepteur de Requête (Sécurisé contre les crashs de chaîne brute)
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'user_session' });
      if (credentials && credentials.password) {
        if (credentials.password.startsWith('{')) {
          const session = JSON.parse(credentials.password);
          if (session && session.access) {
            config.headers.Authorization = `Bearer ${session.access}`;
          }
        }
      }
    } catch (error) {
      console.error('[Interceptor Request] Erreur lecture Keychain:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Intercepteur de Réponse (Correction de la re-soumission)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.includes('/users/login/refresh/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const credentials = await Keychain.getGenericPassword({ service: 'user_session' });
        if (credentials && credentials.password) {
          if (!credentials.password.startsWith('{')) {
            throw new Error('Invalid session format');
          }

          const session = JSON.parse(credentials.password);
          
          if (!session || !session.refresh) {
            throw new Error('No refresh token available');
          }

          const response = await axios({
            method: 'post',
            url: `${API_URL}/users/login/refresh/`,
            headers: { 'Content-Type': 'application/json' },
            data: { refresh: session.refresh }
          });

          const newAccessToken = response.data.access;

          const updatedSession = {
            access: newAccessToken,
            refresh: session.refresh,
          };
          
          await Keychain.setGenericPassword('user_session', JSON.stringify(updatedSession), { service: 'user_session' });

          // ✅ CORRECTION : On met à jour directement la configuration de la requête en cours
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          // ✅ CORRECTION : On utilise une instance axios de base avec l'URL absolue 
          // pour contourner l'intercepteur de requête global qui risquerait de relire l'ancien token.
          originalRequest.baseURL = API_URL;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('[Interceptor Response] Échec critique du refresh token:', refreshError);
        await Keychain.resetGenericPassword({ service: 'user_session' });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
