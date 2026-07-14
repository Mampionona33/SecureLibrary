import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';

const KEYCHAIN_KEYS = {
  SESSION: 'user_session',
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Étendre le type pour ajouter _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ==================== HELPERS ====================

/**
 * Récupère le token d'accès depuis Keychain
 * Priorité: 1. Session JSON, 2. Token individuel
 */
const getAccessToken = async (): Promise<string | null> => {
  try {
    // 1. Essayer d'abord le format session (JSON)
    const sessionData = await Keychain.getGenericPassword({ 
      service: KEYCHAIN_KEYS.SESSION 
    });
    
    if (sessionData && sessionData.password) {
      try {
        const session = JSON.parse(sessionData.password);
        if (session.access) {
          return session.access;
        }
      } catch (parseError) {
        // Ce n'est pas du JSON, c'est peut-être un token brut
        return sessionData.password;
      }
    }

    // 2. Fallback: token individuel
    const tokenData = await Keychain.getGenericPassword({ 
      service: KEYCHAIN_KEYS.ACCESS_TOKEN 
    });
    
    if (tokenData && tokenData.password) {
      return tokenData.password;
    }

    return null;
  } catch (error) {
    console.error('[getAccessToken] Erreur:', error);
    return null;
  }
};

/**
 * Récupère le refresh token depuis Keychain
 * Priorité: 1. Session JSON, 2. Token individuel
 */
const getRefreshToken = async (): Promise<string | null> => {
  try {
    // 1. Essayer d'abord le format session (JSON)
    const sessionData = await Keychain.getGenericPassword({ 
      service: KEYCHAIN_KEYS.SESSION 
    });
    
    if (sessionData && sessionData.password) {
      try {
        const session = JSON.parse(sessionData.password);
        if (session.refresh) {
          return session.refresh;
        }
      } catch (parseError) {
        // Ignorer et passer au fallback
      }
    }

    // 2. Fallback: refresh token individuel
    const refreshData = await Keychain.getGenericPassword({ 
      service: KEYCHAIN_KEYS.REFRESH_TOKEN 
    });
    
    if (refreshData && refreshData.password) {
      return refreshData.password;
    }

    return null;
  } catch (error) {
    console.error('[getRefreshToken] Erreur:', error);
    return null;
  }
};

/**
 * Met à jour la session avec les nouveaux tokens
 */
const updateSession = async (accessToken: string, refreshToken?: string): Promise<void> => {
  try {
    // Si on a un refresh token, on stocke la session complète
    if (refreshToken) {
      const session = { 
        access: accessToken, 
        refresh: refreshToken 
      };
      
      await Keychain.setGenericPassword(
        'user_session',
        JSON.stringify(session),
        { service: KEYCHAIN_KEYS.SESSION }
      );
      
      // Mettre à jour aussi les tokens individuels pour compatibilité
      await Keychain.setGenericPassword(
        'user_session',
        accessToken,
        { service: KEYCHAIN_KEYS.ACCESS_TOKEN }
      );
      
      await Keychain.setGenericPassword(
        'user_refresh',
        refreshToken,
        { service: KEYCHAIN_KEYS.REFRESH_TOKEN }
      );
      
      return;
    }

    // Sinon, on essaie de récupérer le refresh existant
    const existingRefresh = await getRefreshToken();
    
    if (existingRefresh) {
      const session = { 
        access: accessToken, 
        refresh: existingRefresh 
      };
      
      await Keychain.setGenericPassword(
        'user_session',
        JSON.stringify(session),
        { service: KEYCHAIN_KEYS.SESSION }
      );
      
      // Mettre à jour le token d'accès individuel
      await Keychain.setGenericPassword(
        'user_session',
        accessToken,
        { service: KEYCHAIN_KEYS.ACCESS_TOKEN }
      );
    } else {
      // Si pas de refresh, stocker juste le token d'accès
      await Keychain.setGenericPassword(
        'user_session',
        accessToken,
        { service: KEYCHAIN_KEYS.ACCESS_TOKEN }
      );
    }
  } catch (error) {
    console.error('[updateSession] Erreur:', error);
  }
};

/**
 * Nettoie tous les tokens de Keychain
 */
const clearAllTokens = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ 
      service: KEYCHAIN_KEYS.SESSION 
    });
    await Keychain.resetGenericPassword({ 
      service: KEYCHAIN_KEYS.ACCESS_TOKEN 
    });
    await Keychain.resetGenericPassword({ 
      service: KEYCHAIN_KEYS.REFRESH_TOKEN 
    });
  } catch (error) {
    console.error('[clearAllTokens] Erreur:', error);
  }
};

// ==================== REQUEST INTERCEPTORS ====================

/**
 * Intercepteur de requête - Ajoute le token d'autorisation
 */
export const requestInterceptor = async (config: any): Promise<any> => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('[Interceptor Request] Erreur:', error);
  }
  return config;
};

/**
 * Intercepteur d'erreur de requête
 */
export const requestErrorInterceptor = (error: any): Promise<any> => {
  return Promise.reject(error);
};

// ==================== RESPONSE INTERCEPTORS ====================

/**
 * Intercepteur de réponse succès
 */
export const responseSuccessInterceptor = (response: any): any => {
  return response;
};

/**
 * Intercepteur de réponse - Gère le refresh token en cas de 401
 */
export const responseInterceptor = async (error: any): Promise<any> => {
  const originalRequest = error.config as CustomAxiosRequestConfig;

  // Vérifier si c'est une erreur 401
  const isUnauthorized = error.response?.status === 401;
  
  // Éviter les boucles infinies - ne pas retenter sur les endpoints de refresh
  const isRefreshEndpoint = originalRequest.url?.includes('/users/login/refresh/') || 
                           originalRequest.url?.includes('/users/token/refresh/');

  if (isRefreshEndpoint) {
    return Promise.reject(error);
  }

  // Si ce n'est pas une 401 ou déjà retenté, rejeter
  if (!isUnauthorized || originalRequest._retry) {
    return Promise.reject(error);
  }

  // Marquer comme retenté pour éviter les boucles
  originalRequest._retry = true;

  try {
    // 1. Récupérer le refresh token
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      console.warn('[Interceptor] Aucun refresh token disponible, nettoyage des tokens');
      await clearAllTokens();
      return Promise.reject(error);
    }

    // 2. Appeler l'API de refresh
    console.log('[Interceptor] Tentative de rafraîchissement du token...');
    
    const refreshResponse = await axios({
      method: 'post',
      url: `${API_URL}/users/token/refresh/`,
      headers: { 'Content-Type': 'application/json' },
      data: { refresh: refreshToken },
      timeout: 10000,
    });

    const newAccessToken = refreshResponse.data?.access;

    if (!newAccessToken) {
      console.warn('[Interceptor] Aucun nouveau token reçu, nettoyage des tokens');
      await clearAllTokens();
      return Promise.reject(error);
    }

    console.log('[Interceptor] Token rafraîchi avec succès');

    // 3. Mettre à jour la session avec le nouveau token
    await updateSession(newAccessToken, refreshToken);

    // 4. Mettre à jour la requête originale avec le nouveau token
    if (originalRequest.headers) {
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    }

    // 5. Réessayer la requête originale
    console.log('[Interceptor] Réexécution de la requête originale');
    return axios(originalRequest);

  } catch (refreshError) {
    console.error('[Interceptor] Échec du rafraîchissement:', refreshError);
    
    // Si le refresh échoue, déconnecter l'utilisateur
    await clearAllTokens();
    
    return Promise.reject(refreshError);
  }
};
