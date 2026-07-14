// __tests__/api/interceptors.test.ts
import axios from 'axios';
import * as Keychain from 'react-native-keychain';

// Mock de @env AVANT d'importer les intercepteurs
jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

// Mock des dépendances
jest.mock('axios');
jest.mock('react-native-keychain');

import { 
  requestInterceptor, 
  requestErrorInterceptor,
  responseSuccessInterceptor,
  responseInterceptor 
} from '../../api/interceptors';

const mockedKeychain = Keychain as jest.Mocked<typeof Keychain>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Réinitialiser complètement les mocks d'axios
    (mockedAxios as any).mockReset();
    // Configurer un mock par défaut pour axios
    (mockedAxios as any).mockResolvedValue({ data: 'success' });
  });

  describe('requestInterceptor', () => {
    it('should add Authorization header when valid session exists', async () => {
      const mockSession = {
        access: 'test-access-token',
        refresh: 'test-refresh-token',
      };
      mockedKeychain.getGenericPassword.mockResolvedValue({
        username: 'user_session',
        password: JSON.stringify(mockSession),
        service: 'user_session',
        storage: 'keychain',
      });

      const config = {
        headers: {},
        method: 'get',
        url: '/test',
      };

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockSession.access}`);
      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
    });

    it('should not add Authorization header when no session exists', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValue(false);

      const config = {
        headers: {},
        method: 'get',
        url: '/test',
      };

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
    });

    it('should not add Authorization header when password is not JSON', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValue({
        username: 'user_session',
        password: 'plain-text-token',
        service: 'user_session',
        storage: 'keychain',
      });

      const config = {
        headers: {},
        method: 'get',
        url: '/test',
      };

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
    });

    it('should handle Keychain error gracefully', async () => {
      mockedKeychain.getGenericPassword.mockRejectedValue(new Error('Keychain error'));

      const config = {
        headers: {},
        method: 'get',
        url: '/test',
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Interceptor Request] Erreur lecture Keychain:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle missing access token in session', async () => {
      const mockSession = {
        refresh: 'test-refresh-token',
      };
      mockedKeychain.getGenericPassword.mockResolvedValue({
        username: 'user_session',
        password: JSON.stringify(mockSession),
        service: 'user_session',
        storage: 'keychain',
      });

      const config = {
        headers: {},
        method: 'get',
        url: '/test',
      };

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
    });
  });

  describe('requestErrorInterceptor', () => {
    it('should reject with the error', async () => {
      const error = new Error('Request error');
      await expect(requestErrorInterceptor(error)).rejects.toThrow('Request error');
    });
  });

  describe('responseSuccessInterceptor', () => {
    it('should pass through successful responses', () => {
      const response = {
        data: { success: true },
        status: 200,
        config: {},
        headers: {},
        statusText: 'OK',
      };

      const result = responseSuccessInterceptor(response);
      expect(result).toBe(response);
    });
  });

  describe('responseInterceptor', () => {
    it('should attempt token refresh on 401 error', async () => {
      const mockSession = {
        access: 'old-access-token',
        refresh: 'test-refresh-token',
      };
      const newAccessToken = 'new-access-token';

      mockedKeychain.getGenericPassword.mockResolvedValue({
        username: 'user_session',
        password: JSON.stringify(mockSession),
        service: 'user_session',
        storage: 'keychain',
      });

      mockedKeychain.setGenericPassword.mockResolvedValue(true);

      const mockRefreshResponse = {
        data: { access: newAccessToken },
        status: 200,
        config: {},
        headers: {},
        statusText: 'OK',
      };

      // Utiliser mockImplementationOnce au lieu de mockResolvedValueOnce
      mockedAxios.mockImplementationOnce(() => Promise.resolve(mockRefreshResponse));
      mockedAxios.mockImplementationOnce(() => Promise.resolve({ data: 'success' }));

      const originalRequest = {
        _retry: false,
        headers: {},
        method: 'get',
        url: '/test',
      };

      const error = {
        response: {
          status: 401,
        },
        config: originalRequest,
      };

      await responseInterceptor(error);

      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
      
      const env = require('@env');
      const expectedRefreshUrl = `${env.API_URL}/users/login/refresh/`;
      
      // Vérifier que axios a été appelé pour le refresh
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'post',
        url: expectedRefreshUrl,
        headers: { 'Content-Type': 'application/json' },
        data: { refresh: mockSession.refresh },
      });

      expect(mockedKeychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        JSON.stringify({
          access: newAccessToken,
          refresh: mockSession.refresh,
        }),
        { service: 'user_session' }
      );

      expect(originalRequest.headers.Authorization).toBe(`Bearer ${newAccessToken}`);
    });

    it('should not attempt refresh on refresh endpoint', async () => {
      const originalRequest = {
        _retry: false,
        headers: {},
        method: 'post',
        url: '/users/login/refresh/',
      };

      const error = {
        response: {
          status: 401,
        },
        config: originalRequest,
      };

      await expect(responseInterceptor(error)).rejects.toBe(error);

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it('should not attempt refresh if already retried', async () => {
      const originalRequest = {
        _retry: true,
        headers: {},
        method: 'get',
        url: '/test',
      };

      const error = {
        response: {
          status: 401,
        },
        config: originalRequest,
      };

      await expect(responseInterceptor(error)).rejects.toBe(error);

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it('should handle missing session during refresh', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValue(false);

      const originalRequest = {
        _retry: false,
        headers: {},
        method: 'get',
        url: '/test',
      };

      const error = {
        response: {
          status: 401,
        },
        config: originalRequest,
      };

      await expect(responseInterceptor(error)).rejects.toBe(error);

      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it('should handle invalid session format during refresh', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValue({
        username: 'user_session',
        password: 'invalid-json',
        service: 'user_session',
        storage: 'keychain',
      });

      const originalRequest = {
        _retry: false,
        headers: {},
        method: 'get',
        url: '/test',
      };

      const error = {
        response: {
          status: 401,
        },
        config: originalRequest,
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await responseInterceptor(error);
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('Invalid session format');
      }

      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'local_vault_pin',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Interceptor Response] Échec critique du refresh token:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle refresh API failure', async () => {
      const mockSession = {
        access: 'old-access-token',
        refresh: 'test-refresh-token',
      };

      mockedKeychain.getGenericPassword.mockResolvedValue({
        username: 'user_session',
        password: JSON.stringify(mockSession),
        service: 'user_session',
        storage: 'keychain',
      });

      const refreshError = new Error('Refresh failed');
      mockedAxios.mockRejectedValue(refreshError);

      const originalRequest = {
        _retry: false,
        headers: {},
        method: 'get',
        url: '/test',
      };

      const error = {
        response: {
          status: 401,
        },
        config: originalRequest,
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await responseInterceptor(error);
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBe(refreshError);
      }

      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'local_vault_pin',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Interceptor Response] Échec critique du refresh token:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle missing refresh token during refresh', async () => {
      const mockSession = {
        access: 'old-access-token',
      };

      mockedKeychain.getGenericPassword.mockResolvedValue({
        username: 'user_session',
        password: JSON.stringify(mockSession),
        service: 'user_session',
        storage: 'keychain',
      });

      const originalRequest = {
        _retry: false,
        headers: {},
        method: 'get',
        url: '/test',
      };

      const error = {
        response: {
          status: 401,
        },
        config: originalRequest,
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      try {
        await responseInterceptor(error);
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe('No refresh token available');
      }

      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'local_vault_pin',
      });
      expect(mockedAxios).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle non-401 errors without refresh', async () => {
      const error = {
        response: {
          status: 404,
        },
        config: {
          _retry: false,
          url: '/test',
        },
      };

      await expect(responseInterceptor(error)).rejects.toBe(error);

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it('should handle errors without response', async () => {
      const error = {
        request: {},
        config: {
          _retry: false,
          url: '/test',
        },
      };

      await expect(responseInterceptor(error)).rejects.toBe(error);

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it('should handle error without config', async () => {
      const error = {
        response: {
          status: 401,
        },
      };

      try {
        await responseInterceptor(error);
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
      }

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
      expect(mockedAxios).not.toHaveBeenCalled();
    });
  });
});
