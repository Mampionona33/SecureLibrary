import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ATTENTION: Sur l'émulateur Android, 'localhost' ou '127.0.0.1' pointe vers l'émulateur lui-même.
// Il faut utiliser '10.0.2.2' pour pointer vers le backend Django de votre ordinateur.
const BASE_URL = 'http://10.0.2.2:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Intercepteur de REQUÊTE : Ajoute le token d'accès avant chaque appel API
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Intercepteur de RÉPONSE : Gère l'expiration du token (Erreur 401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et qu'on n'a pas encore essayé de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Empêche la boucle infinie

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          // On appelle directement axios classique (pas apiClient pour éviter les boucles)
          const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          await AsyncStorage.setItem('accessToken', newAccessToken);

          // On met à jour le header de la requête originale et on la relance
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Si le refresh token est expiré ou invalide, on déconnecte l'utilisateur
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // Ici, il faudrait idéalement rediriger vers l'écran de Login
      }
    }
    return Promise.reject(error);
  }
);
