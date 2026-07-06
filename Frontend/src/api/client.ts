import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const credentials = await Keychain.getGenericPassword({ service: 'auth_token' });
    if (credentials && credentials.password) {
      config.headers.Authorization = `Bearer ${credentials.password}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshCredentials = await Keychain.getGenericPassword({ service: 'refresh_token' });
        if (refreshCredentials && refreshCredentials.password) {
          const response = await axios.post(`${API_URL}/users/token/refresh/`, {
            refresh: refreshCredentials.password,
          });

          const newAccessToken = response.data.access;
          await Keychain.setGenericPassword('user_session', newAccessToken, { service: 'auth_token' });

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        await Keychain.resetGenericPassword({ service: 'auth_token' });
        await Keychain.resetGenericPassword({ service: 'refresh_token' });
      }
    }
    return Promise.reject(error);
  }
);
