import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';

const KEYCHAIN_KEYS = {
  SESSION: 'user_session',
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

// ============================================
// 🔧 FONCTIONS DE GESTION DES TOKENS
// ============================================

const getAccessToken = async (): Promise<string | null> => {
  try {
    // 1. Essayer de récupérer depuis ACCESS_TOKEN
    const tokenData = await Keychain.getGenericPassword({
      service: KEYCHAIN_KEYS.ACCESS_TOKEN,
    });
    if (tokenData?.password) {
      return tokenData.password;
    }

    // 2. Fallback: récupérer depuis SESSION
    const sessionData = await Keychain.getGenericPassword({
      service: KEYCHAIN_KEYS.SESSION,
    });
    if (sessionData?.password) {
      try {
        const session = JSON.parse(sessionData.password);
        if (session?.access) return session.access;
      } catch (_) {
        // Pas un JSON, retourner tel quel
        return sessionData.password;
      }
    }

    return null;
  } catch (error) {
    console.error('[getAccessToken] Error:', error);
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    // 1. Essayer de récupérer depuis REFRESH_TOKEN
    const refreshData = await Keychain.getGenericPassword({
      service: KEYCHAIN_KEYS.REFRESH_TOKEN,
    });
    if (refreshData?.password) {
      return refreshData.password;
    }

    // 2. Fallback: récupérer depuis SESSION
    const sessionData = await Keychain.getGenericPassword({
      service: KEYCHAIN_KEYS.SESSION,
    });
    if (sessionData?.password) {
      try {
        const session = JSON.parse(sessionData.password);
        if (session?.refresh) return session.refresh;
      } catch (_) {}
    }

    console.log('[getRefreshToken] No refresh token found');
    return null;
  } catch (error) {
    console.error('[getRefreshToken] Error:', error);
    return null;
  }
};

const updateTokens = async (accessToken: string, refreshToken?: string): Promise<void> => {
  try {
    // 1. Stocker l'access token
    await Keychain.setGenericPassword(
      KEYCHAIN_KEYS.ACCESS_TOKEN,
      accessToken,
      { service: KEYCHAIN_KEYS.ACCESS_TOKEN }
    );

    // 2. Stocker le refresh token si fourni
    if (refreshToken) {
      await Keychain.setGenericPassword(
        KEYCHAIN_KEYS.REFRESH_TOKEN,
        refreshToken,
        { service: KEYCHAIN_KEYS.REFRESH_TOKEN }
      );
    }

    // 3. Mettre à jour la session
    const existingRefresh = refreshToken || await getRefreshToken();
    const session = { 
      access: accessToken, 
      refresh: existingRefresh 
    };
    await Keychain.setGenericPassword(
      KEYCHAIN_KEYS.SESSION,
      JSON.stringify(session),
      { service: KEYCHAIN_KEYS.SESSION }
    );

    console.log('[updateTokens] Tokens updated successfully');
  } catch (error) {
    console.error('[updateTokens] Error:', error);
  }
};

const clearAllTokens = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
    await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
    await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
    console.log('[clearAllTokens] All tokens cleared');
  } catch (error) {
    console.error('[clearAllTokens] Error:', error);
  }
};

// ============================================
// 🔧 PROCESSUS DE REFRESH
// ============================================

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  console.log('[Refresh] Attempting to refresh token...');
  
  // ✅ URL CORRECTE: /users/login/refresh/
  const response = await axios({
    method: 'post',
    url: `${API_URL}/users/login/refresh/`,
    headers: { 'Content-Type': 'application/json' },
    data: { refresh: refreshToken },
    timeout: 10000,
  });

  const newAccessToken = response.data?.access;
  const newRefreshToken = response.data?.refresh;

  if (!newAccessToken) {
    throw new Error('No access token in refresh response');
  }

  // ✅ Mettre à jour les tokens
  await updateTokens(newAccessToken, newRefreshToken || refreshToken);
  
  console.log('[Refresh] Token refreshed successfully');
  return newAccessToken;
};

// ============================================
// 📤 INTERCEPTEUR REQUÊTE
// ============================================

export const requestInterceptor = async (config: any): Promise<any> => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('[Interceptor Request] Error:', error);
  }
  return config;
};

export const requestErrorInterceptor = (error: any): Promise<any> => {
  console.error('[Interceptor Request Error]:', error);
  return Promise.reject(error);
};

export const responseSuccessInterceptor = (response: any): any => {
  console.log(`📥 [${response.status}] ${response.config?.url}`);
  return response;
};

// ============================================
// 📥 INTERCEPTEUR RÉPONSE (avec refresh)
// ============================================

export const responseInterceptor = async (error: any): Promise<any> => {
  const originalRequest = error.config as CustomAxiosRequestConfig;

  // ⚠️ Si pas d'erreur ou pas de config, rejeter
  if (!error || !originalRequest) {
    return Promise.reject(error);
  }

  // 🔍 Vérifier si c'est une erreur 401
  const isUnauthorized = error.response?.status === 401;
  
  // 🚫 Ne pas réessayer les endpoints de refresh eux-mêmes
  const isRefreshEndpoint = 
    originalRequest.url?.includes('/token/refresh/') ||
    originalRequest.url?.includes('/users/login/refresh/');

  // Si déjà retry ou pas une 401 ou c'est le refresh endpoint
  if (originalRequest._retry || !isUnauthorized || isRefreshEndpoint) {
    return Promise.reject(error);
  }

  // 🏷️ Marquer comme retry
  originalRequest._retry = true;

  // ⏳ Si déjà en cours de refresh, mettre en queue
  if (isRefreshing) {
    console.log('[Interceptor] Refresh in progress, queueing request...');
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
        }
        return axios(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  // 🔄 Démarrer le refresh
  isRefreshing = true;

  try {
    const newAccessToken = await refreshAccessToken();

    // ✅ Mettre à jour les requêtes en queue
    processQueue(null, newAccessToken);
    isRefreshing = false;

    // 🔄 Retenter la requête originale
    if (originalRequest.headers) {
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    }
    return axios(originalRequest);

  } catch (refreshError) {
    console.error('[Interceptor] Refresh failed:', refreshError);

    // ❌ Nettoyer tout
    await clearAllTokens();
    processQueue(refreshError, null);
    isRefreshing = false;

    return Promise.reject(refreshError);
  }
};
