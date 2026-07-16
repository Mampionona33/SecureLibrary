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

const getAccessToken = async (): Promise<string | null> => {
  try {
    const sessionData = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
    if (sessionData?.password) {
      try {
        const session = JSON.parse(sessionData.password);
        if (session.access) return session.access;
      } catch (_) {
        return sessionData.password;
      }
    }
    const tokenData = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
    return tokenData?.password || null;
  } catch (error) {
    console.error('[getAccessToken] Erreur:', error);
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    // D'abord essayer le token individuel (le plus fiable)
    const refreshData = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
    if (refreshData?.password) return refreshData.password;

    // Fallback : session JSON
    const sessionData = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
    if (sessionData?.password) {
      try {
        const session = JSON.parse(sessionData.password);
        if (session.refresh) return session.refresh;
      } catch (_) {}
    }
    return null;
  } catch (error) {
    console.error('[getRefreshToken] Erreur:', error);
    return null;
  }
};

const updateSession = async (accessToken: string, refreshToken?: string): Promise<void> => {
  try {
    if (refreshToken) {
      const session = { access: accessToken, refresh: refreshToken };
      await Keychain.setGenericPassword('user_session', JSON.stringify(session), { service: KEYCHAIN_KEYS.SESSION });
      await Keychain.setGenericPassword('user_session', accessToken, { service: KEYCHAIN_KEYS.ACCESS_TOKEN });
      await Keychain.setGenericPassword('user_refresh', refreshToken, { service: KEYCHAIN_KEYS.REFRESH_TOKEN });
      return;
    }
    const existingRefresh = await getRefreshToken();
    if (existingRefresh) {
      const session = { access: accessToken, refresh: existingRefresh };
      await Keychain.setGenericPassword('user_session', JSON.stringify(session), { service: KEYCHAIN_KEYS.SESSION });
      await Keychain.setGenericPassword('user_session', accessToken, { service: KEYCHAIN_KEYS.ACCESS_TOKEN });
    } else {
      await Keychain.setGenericPassword('user_session', accessToken, { service: KEYCHAIN_KEYS.ACCESS_TOKEN });
    }
  } catch (error) {
    console.error('[updateSession] Erreur:', error);
  }
};

const clearAllTokens = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
    await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
    await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
  } catch (error) {
    console.error('[clearAllTokens] Erreur:', error);
  }
};

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

export const requestErrorInterceptor = (error: any): Promise<any> => {
  return Promise.reject(error);
};

export const responseSuccessInterceptor = (response: any): any => {
  return response;
};

export const responseInterceptor = async (error: any): Promise<any> => {
  const originalRequest = error.config as CustomAxiosRequestConfig;

  const isUnauthorized = error.response?.status === 401;
  const isRefreshEndpoint = originalRequest.url?.includes('/token/refresh/') ||
                           originalRequest.url?.includes('/users/login/refresh/');

  if (isRefreshEndpoint || !isUnauthorized || originalRequest._retry) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      console.warn('[Interceptor] Aucun refresh token disponible, nettoyage des tokens');
      await clearAllTokens();
      return Promise.reject(error);
    }

    console.log('[Interceptor] Tentative de rafraîchissement du token...');
    const refreshResponse = await axios({
      method: 'post',
      url: `${API_URL}/token/refresh/`,
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
    await updateSession(newAccessToken, refreshToken);

    if (originalRequest.headers) {
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    }
    return axios(originalRequest);

  } catch (refreshError) {
    console.error('[Interceptor] Échec du rafraîchissement:', refreshError);
    await clearAllTokens();
    return Promise.reject(refreshError);
  }
};
