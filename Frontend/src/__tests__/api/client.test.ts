import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';
import { apiClient } from '@api/client';

// Mock dependencies
jest.mock('axios');
jest.mock('react-native-keychain');
jest.mock('@env', () => ({
  API_URL: 'https://api.test.com',
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios defaults
    apiClient.defaults.headers.common = {};
    apiClient.defaults.headers.Authorization = undefined;
  });

  describe('Request Interceptor', () => {
    test('should add Authorization header when valid session exists', async () => {
      const mockSession = JSON.stringify({
        access: 'valid-access-token',
        refresh: 'valid-refresh-token',
      });

      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: mockSession,
        service: 'user_session',
        storage: 'keychain' as any,
      });

      const config = {
        headers: {},
        url: '/test',
      };

      const result = await (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer valid-access-token');
      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
    });

    test('should handle session with access token inside nested object', async () => {
      const mockSession = JSON.stringify({
        access: 'nested-access-token',
        refresh: 'nested-refresh-token',
        user: { id: 1 },
      });

      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: mockSession,
        service: 'user_session',
        storage: 'keychain' as any,
      });

      const config = {
        headers: {},
        url: '/test',
      };

      const result = await (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBe('Bearer nested-access-token');
    });

    test('should not add Authorization header when no credentials exist', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValueOnce(null);

      const config = {
        headers: {},
        url: '/test',
      };

      const result = await (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
    });

    test('should not add Authorization header when password is empty', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: '',
        service: 'user_session',
        storage: 'keychain' as any,
      });

      const config = {
        headers: {},
        url: '/test',
      };

      const result = await (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    test('should handle non-JSON password gracefully', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: 'plain-text-token',
        service: 'user_session',
        storage: 'keychain' as any,
      });

      const config = {
        headers: {},
        url: '/test',
      };

      const result = await (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    test('should handle Keychain error gracefully', async () => {
      mockedKeychain.getGenericPassword.mockRejectedValueOnce(
        new Error('Keychain unavailable')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        headers: {},
        url: '/test',
      };

      const result = await (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Interceptor Request] Erreur lecture Keychain:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test('should handle malformed JSON in password', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: '{invalid json}',
        service: 'user_session',
        storage: 'keychain' as any,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const config = {
        headers: {},
        url: '/test',
      };

      const result = await (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
      
      consoleSpy.mockRestore();
    });

    test('should handle session with missing access token', async () => {
      const mockSession = JSON.stringify({
        refresh: 'valid-refresh-token',
      });

      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: mockSession,
        service: 'user_session',
        storage: 'keychain' as any,
      });

      const config = {
        headers: {},
        url: '/test',
      };

      const result = await (apiClient.interceptors.request as any).handlers[0].fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    test('should pass through successful responses', async () => {
      const response = { data: 'success', status: 200 };
      
      const result = await (apiClient.interceptors.response as any).handlers[0].fulfilled(response);
      
      expect(result).toEqual(response);
    });

    test('should not attempt refresh on refresh endpoint', async () => {
      const error = {
        config: { url: '/users/login/refresh/', _retry: false },
        response: { status: 401 },
      };

      await expect(
        (apiClient.interceptors.response as any).handlers[1].rejected(error)
      ).rejects.toEqual(error);

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
    });

    test('should refresh token on 401 and retry request', async () => {
      const mockSession = JSON.stringify({
        access: 'old-token',
        refresh: 'refresh-token',
      });

      const newAccessToken = 'new-access-token';
      const originalRequest = {
        url: '/protected',
        headers: {},
        _retry: false,
        baseURL: API_URL,
      };

      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: mockSession,
        service: 'user_session',
        storage: 'keychain' as any,
      });

      mockedAxios.mockImplementationOnce(() => 
        Promise.resolve({ data: { access: newAccessToken } })
      );

      mockedKeychain.setGenericPassword.mockResolvedValueOnce(true);

      const error = {
        config: originalRequest,
        response: { status: 401 },
      };

      const result = await (apiClient.interceptors.response as any).handlers[1].rejected(error);

      expect(mockedKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
      expect(mockedKeychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        JSON.stringify({
          access: newAccessToken,
          refresh: 'refresh-token',
        }),
        { service: 'user_session' }
      );
      expect(result.config.headers.Authorization).toBe(`Bearer ${newAccessToken}`);
    });

    test('should handle token refresh failure', async () => {
      const mockSession = JSON.stringify({
        access: 'old-token',
        refresh: 'refresh-token',
      });

      const originalRequest = {
        url: '/protected',
        headers: {},
        _retry: false,
        baseURL: API_URL,
      };

      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: mockSession,
        service: 'user_session',
        storage: 'keychain' as any,
      });

      mockedAxios.mockImplementationOnce(() => 
        Promise.reject(new Error('Refresh failed'))
      );

      mockedKeychain.resetGenericPassword.mockResolvedValueOnce(true);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = {
        config: originalRequest,
        response: { status: 401 },
      };

      await expect(
        (apiClient.interceptors.response as any).handlers[1].rejected(error)
      ).rejects.toThrow('Refresh failed');

      expect(mockedKeychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Interceptor Response] Échec critique du refresh token:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test('should handle missing refresh token', async () => {
      const mockSession = JSON.stringify({
        access: 'old-token',
        // No refresh token
      });

      const originalRequest = {
        url: '/protected',
        headers: {},
        _retry: false,
        baseURL: API_URL,
      };

      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: mockSession,
        service: 'user_session',
        storage: 'keychain' as any,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = {
        config: originalRequest,
        response: { status: 401 },
      };

      await expect(
        (apiClient.interceptors.response as any).handlers[1].rejected(error)
      ).rejects.toThrow('No refresh token available');

      expect(mockedAxios).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('should handle invalid session format', async () => {
      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: 'plain-text-invalid',
        service: 'user_session',
        storage: 'keychain' as any,
      });

      const originalRequest = {
        url: '/protected',
        headers: {},
        _retry: false,
        baseURL: API_URL,
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = {
        config: originalRequest,
        response: { status: 401 },
      };

      await expect(
        (apiClient.interceptors.response as any).handlers[1].rejected(error)
      ).rejects.toThrow('Invalid session format');

      expect(mockedAxios).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test('should not retry if already retried', async () => {
      const originalRequest = {
        url: '/protected',
        headers: {},
        _retry: true,
        baseURL: API_URL,
      };

      const error = {
        config: originalRequest,
        response: { status: 401 },
      };

      await expect(
        (apiClient.interceptors.response as any).handlers[1].rejected(error)
      ).rejects.toEqual(error);

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
    });

    test('should handle 401 without response object', async () => {
      const originalRequest = {
        url: '/protected',
        headers: {},
        _retry: false,
        baseURL: API_URL,
      };

      const error = {
        config: originalRequest,
        // No response object
      };

      await expect(
        (apiClient.interceptors.response as any).handlers[1].rejected(error)
      ).rejects.toEqual(error);

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
    });

    test('should handle non-401 errors', async () => {
      const error = {
        config: { url: '/test' },
        response: { status: 404 },
      };

      await expect(
        (apiClient.interceptors.response as any).handlers[1].rejected(error)
      ).rejects.toEqual(error);

      expect(mockedKeychain.getGenericPassword).not.toHaveBeenCalled();
    });

    test('should handle refresh token response without access token', async () => {
      const mockSession = JSON.stringify({
        access: 'old-token',
        refresh: 'refresh-token',
      });

      const originalRequest = {
        url: '/protected',
        headers: {},
        _retry: false,
        baseURL: API_URL,
      };

      mockedKeychain.getGenericPassword.mockResolvedValueOnce({
        password: mockSession,
        service: 'user_session',
        storage: 'keychain' as any,
      });

      mockedAxios.mockImplementationOnce(() => 
        Promise.resolve({ data: {} }) // No access token
      );

      const error = {
        config: originalRequest,
        response: { status: 401 },
      };

      await expect(
        (apiClient.interceptors.response as any).handlers[1].rejected(error)
      ).rejects.toBeDefined();

      // Should attempt to set new token (even if undefined)
      expect(mockedKeychain.setGenericPassword).toHaveBeenCalled();
    });
  });
});
