// api/interceptors.ts
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';

// Intercepteur de requête
export const requestInterceptor = async (config: any) => {
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
};

export const requestErrorInterceptor = (error: any) => {
  return Promise.reject(error);
};

// Intercepteur de réponse
export const responseInterceptor = async (error: any) => {
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

        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
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
};

export const responseSuccessInterceptor = (response: any) => {
  return response;
};
