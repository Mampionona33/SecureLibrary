import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';
import { MAIN_API_BASE_URL } from '@api/config';

// ✅ Utiliser les MÊMES clés que dans useAuthStore
const KEYCHAIN_KEYS = {
  SESSION: 'user_session',
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ============================================
// 🔧 FONCTIONS DE GESTION DES TOKENS
// ============================================

const getAccessToken = async (): Promise<string | null> => {
  try {
    // ✅ Utiliser la même clé que dans le store
    const result = await Keychain.getGenericPassword({
      service: KEYCHAIN_KEYS.ACCESS_TOKEN,
    });
    return result?.password || null;
  } catch (error) {
    console.error('[getAccessToken] Error:', error);
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    // ✅ Utiliser la même clé que dans le store
    const result = await Keychain.getGenericPassword({
      service: KEYCHAIN_KEYS.REFRESH_TOKEN,
    });
    return result?.password || null;
  } catch (error) {
    console.error('[getRefreshToken] Error:', error);
    return null;
  }
};

const updateTokens = async (
  accessToken: string,
  refreshToken?: string,
): Promise<void> => {
  try {
    // ✅ Utiliser les mêmes clés que dans le store
    await Keychain.setGenericPassword(
      KEYCHAIN_KEYS.ACCESS_TOKEN,
      accessToken,
      { service: KEYCHAIN_KEYS.ACCESS_TOKEN },
    );

    if (refreshToken) {
      await Keychain.setGenericPassword(
        KEYCHAIN_KEYS.REFRESH_TOKEN,
        refreshToken,
        { service: KEYCHAIN_KEYS.REFRESH_TOKEN },
      );
    }

    // Mettre à jour la session
    const session = { access: accessToken, refresh: refreshToken };
    await Keychain.setGenericPassword(
      KEYCHAIN_KEYS.SESSION,
      JSON.stringify(session),
      { service: KEYCHAIN_KEYS.SESSION },
    );

    console.log('[updateTokens] Tokens updated');
  } catch (error) {
    console.error('[updateTokens] Error:', error);
  }
};

const clearTokens = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_KEYS.ACCESS_TOKEN,
    });
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_KEYS.REFRESH_TOKEN,
    });
    await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
    console.log('[clearTokens] Tokens cleared');
  } catch (error) {
    console.error('[clearTokens] Error:', error);
  }
};

// ============================================
// 🔧 PROCESSUS DE REFRESH
// ============================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

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
    console.error('[Refresh] No refresh token available');
    throw new Error('No refresh token available');
  }

  console.log('[Refresh] Attempting to refresh token...');

  try {
    // ✅ Utiliser MAIN_API_BASE_URL pour le refresh
    const response = await axios({
      method: 'post',
      url: `${MAIN_API_BASE_URL}/users/login/refresh/`,
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
  } catch (error: any) {
    console.error(
      '[Refresh] Failed:',
      error.response?.data || error.message,
    );
    throw error;
  }
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
      console.log(
        `📤 [${config.method?.toUpperCase()}] ${config.url} - Auth: ✅`,
      );
    } else {
      console.warn(
        `📤 [${config.method?.toUpperCase()}] ${config.url} - Auth: ❌`,
      );
    }
  } catch (error) {
    console.error('[Request Interceptor] Error:', error);
  }
  return config;
};

export const requestErrorInterceptor = (error: any): Promise<any> => {
  console.error('[Request Error]', error);
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

  // Si pas d'erreur ou pas de config
  if (!error || !originalRequest) {
    return Promise.reject(error);
  }

  // Si ce n'est pas une 401 ou déjà retry
  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

  // Ne pas retenter les endpoints de refresh
  if (
    originalRequest.url?.includes('/refresh/') ||
    originalRequest.url?.includes('/users/login/refresh/')
  ) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  // Si déjà en cours de refresh
  if (isRefreshing) {
    console.log('[Interceptor] Refresh in progress, queueing...');
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

  isRefreshing = true;

  try {
    const newAccessToken = await refreshAccessToken();

    // ✅ Traiter la queue avec le nouveau token
    processQueue(null, newAccessToken);
    isRefreshing = false;

    // ✅ Retenter la requête originale
    if (originalRequest.headers) {
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    }
    console.log('[Interceptor] Retrying original request with new token');
    return axios(originalRequest);
  } catch (refreshError) {
    console.error('[Interceptor] Refresh failed, clearing tokens');
    await clearTokens();
    processQueue(refreshError, null);
    isRefreshing = false;
    return Promise.reject(refreshError);
  }
};

// ============================================
// 📦 EXPORT POUR UTILISATION DANS API CLIENT
// ============================================

export const setupInterceptors = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use(
    requestInterceptor,
    requestErrorInterceptor,
  );
  axiosInstance.interceptors.response.use(
    responseSuccessInterceptor,
    responseInterceptor,
  );
  console.log('[Interceptors] Setup complete');
};
