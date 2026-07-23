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
let failedQueue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  failedQueue.forEach(callback => callback(token));
  failedQueue = [];
};

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
    console.error('[getAccessToken] Error:', error);
    return null;
  }
};

const getRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshData = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
    if (refreshData?.password) {
      console.log('[getRefreshToken] Found individual refresh token');
      return refreshData.password;
    }
    const sessionData = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
    if (sessionData?.password) {
      try {
        const session = JSON.parse(sessionData.password);
        if (session.refresh) {
          console.log('[getRefreshToken] Found refresh token in session');
          return session.refresh;
        }
      } catch (_) {}
    }
    console.log('[getRefreshToken] No refresh token found');
    return null;
  } catch (error) {
    console.error('[getRefreshToken] Error:', error);
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
      console.log('[updateSession] Updated session and individual tokens');
    } else {
      const existingRefresh = await getRefreshToken();
      if (existingRefresh) {
        const session = { access: accessToken, refresh: existingRefresh };
        await Keychain.setGenericPassword('user_session', JSON.stringify(session), { service: KEYCHAIN_KEYS.SESSION });
        await Keychain.setGenericPassword('user_session', accessToken, { service: KEYCHAIN_KEYS.ACCESS_TOKEN });
      } else {
        await Keychain.setGenericPassword('user_session', accessToken, { service: KEYCHAIN_KEYS.ACCESS_TOKEN });
      }
    }
  } catch (error) {
    console.error('[updateSession] Error:', error);
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

export const requestErrorInterceptor = (error: any): Promise<any> => Promise.reject(error);

export const responseSuccessInterceptor = (response: any): any => response;

export const responseInterceptor = async (error: any): Promise<any> => {
  const originalRequest = error.config as CustomAxiosRequestConfig;

  const isUnauthorized = error.response?.status === 401;
  const isRefreshEndpoint = originalRequest.url?.includes('/token/refresh/') ||
                           originalRequest.url?.includes('/users/login/refresh/');

  if (isRefreshEndpoint || !isUnauthorized || originalRequest._retry) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  if (isRefreshing) {
    console.log('[Interceptor] Refresh en cours, ajout à la queue...');
    return new Promise((resolve) => {
      failedQueue.push((token: string) => {
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
        }
        resolve(axios(originalRequest));
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      console.warn('[Interceptor] No refresh token available, clearing tokens.');
      await clearAllTokens();
      isRefreshing = false;
      return Promise.reject(error);
    }

    console.log('[Interceptor] Attempting token refresh...');
    const refreshResponse = await axios({
      method: 'post',
      url: `${API_URL}/token/refresh/`,
      headers: { 'Content-Type': 'application/json' },
      data: { refresh: refreshToken },
      timeout: 10000,
    });

    const newAccessToken = refreshResponse.data?.access;
    const newRefreshToken = refreshResponse.data?.refresh;

    if (!newAccessToken || !newRefreshToken) {
      console.warn('[Interceptor] Tokens incomplets, clearing all');
      await clearAllTokens();
      isRefreshing = false;
      return Promise.reject(error);
    }

    console.log('[Interceptor] Token refreshed successfully.');
    await updateSession(newAccessToken, newRefreshToken);

    if (originalRequest.headers) {
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
    }

    console.log('[Interceptor] Processing queue and retrying original request.');
    processQueue(newAccessToken);
    isRefreshing = false;

    return axios(originalRequest);
  } catch (refreshError) {
    console.error('[Interceptor] Refresh failed:', refreshError);
    await clearAllTokens();
    isRefreshing = false;
    failedQueue = [];
    return Promise.reject(refreshError);
  }
};
