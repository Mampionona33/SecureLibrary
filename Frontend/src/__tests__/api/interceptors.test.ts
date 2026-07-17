import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import { 
  requestInterceptor, 
  requestErrorInterceptor,
  responseInterceptor,
  responseSuccessInterceptor 
} from '@api/interceptors';
import { API_URL } from '@env';

jest.mock('react-native-keychain');

jest.mock('axios');

const mockedAxios = axios as unknown as jest.Mock;

jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

describe('API Interceptors - Tests Complets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestInterceptor', () => {
    it('devrait ajouter le token d\'autorisation depuis le format session (JSON)', async () => {
      const mockSession = {
        access: 'mock-access-token-123',
        refresh: 'mock-refresh-token-456',
      };
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: JSON.stringify(mockSession),
      });

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockSession.access}`);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
    });

    it('devrait utiliser le token individuel si le format session échoue', async () => {
      const mockToken = 'mock-access-token-789';
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce({ password: mockToken });

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'auth_token',
      });
    });

    it('devrait gérer le cas où le token est un string brut dans user_session', async () => {
      const mockToken = 'raw-token-string';
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: mockToken,
      });

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('ne devrait pas ajouter d\'autorisation si aucun token n\'existe', async () => {
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('devrait gérer les erreurs Keychain sans planter', async () => {
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error')
      );

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(result).toEqual(config);
    });
  });

  describe('requestErrorInterceptor', () => {
    it('devrait rejeter l\'erreur telle quelle', async () => {
      const error = new Error('Request failed');

      await expect(requestErrorInterceptor(error)).rejects.toEqual(error);
    });
  });

  describe('responseSuccessInterceptor', () => {
    it('devrait retourner la réponse inchangée', () => {
      const response = {
        data: { success: true },
        status: 200,
        config: { url: '/test' },
      };

      const result = responseSuccessInterceptor(response);

      expect(result).toEqual(response);
    });
  });

  describe('responseInterceptor - Token Refresh', () => {
    it('devrait rafraîchir le token et réessayer la requête en cas de 401', async () => {
      const mockSession = {
        access: 'old-token',
        refresh: 'valid-refresh-token',
      };
      const newAccessToken = 'new-access-token';
      const originalRequest = {
        _retry: false,
        headers: {},
        url: '/api/protected',
        method: 'GET',
        baseURL: API_URL,
      };
      const error = {
        response: { 
          status: 401,
          data: { detail: 'Token expired' },
        },
        config: originalRequest,
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: JSON.stringify(mockSession),
      });

      mockedAxios
        .mockResolvedValueOnce({
          data: { access: newAccessToken },
        })
        .mockResolvedValueOnce({
          data: { success: true },
          status: 200,
        });

      await responseInterceptor(error);

      const calls = mockedAxios.mock.calls;
      expect(calls[0][0]).toEqual({
        method: 'post',
        url: `${API_URL}/token/refresh/`,
        headers: { 'Content-Type': 'application/json' },
        data: { refresh: mockSession.refresh },
        timeout: 10000,
      });

      expect(calls[1][0]).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${newAccessToken}`,
          }),
        })
      );
    });

    it('devrait nettoyer les tokens si le refresh échoue', async () => {
      const mockSession = {
        access: 'old-token',
        refresh: 'expired-refresh-token',
      };
      const originalRequest = {
        _retry: false,
        headers: {},
        url: '/api/protected',
        method: 'GET',
      };
      const error = {
        response: { 
          status: 401,
          data: { detail: 'Token expired' },
        },
        config: originalRequest,
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: JSON.stringify(mockSession),
      });

      const refreshError = new Error('Refresh token expired');
      mockedAxios.mockRejectedValueOnce(refreshError);

      let caughtError: Error | null = null;
      try {
        await responseInterceptor(error);
      } catch (e) {
        caughtError = e as Error;
      }

      expect(caughtError).toBe(refreshError);
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'auth_token',
      });
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'refresh_token',
      });
    });

    it('ne devrait pas tenter de rafraîchir sur les endpoints de refresh', async () => {
      const originalRequest = {
        _retry: false,
        headers: {},
        url: '/users/login/refresh/',
        method: 'POST',
      };
      const error = {
        response: { 
          status: 401,
          data: { detail: 'Invalid refresh' },
        },
        config: originalRequest,
      };

      await expect(responseInterceptor(error)).rejects.toEqual(error);
      expect(Keychain.getGenericPassword).not.toHaveBeenCalled();
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it('devrait nettoyer les tokens si aucun refresh token n\'est disponible', async () => {
      const originalRequest = {
        _retry: false,
        headers: {},
        url: '/api/protected',
        method: 'GET',
      };
      const error = {
        response: { 
          status: 401,
          data: { detail: 'Token expired' },
        },
        config: originalRequest,
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      let caughtError: Error | null = null;
      try {
        await responseInterceptor(error);
      } catch (e) {
        caughtError = e as Error;
      }

      expect(caughtError).toEqual(error);
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'auth_token',
      });
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'refresh_token',
      });
    });

    it('devrait gérer l\'absence de token dans la réponse de refresh', async () => {
      const mockSession = {
        access: 'old-token',
        refresh: 'valid-refresh-token',
      };
      const originalRequest = {
        _retry: false,
        headers: {},
        url: '/api/protected',
        method: 'GET',
      };
      const error = {
        response: { 
          status: 401,
          data: { detail: 'Token expired' },
        },
        config: originalRequest,
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: JSON.stringify(mockSession),
      });

      mockedAxios.mockResolvedValueOnce({
        data: { refresh: 'new-refresh' },
      });

      let caughtError: Error | null = null;
      try {
        await responseInterceptor(error);
      } catch (e) {
        caughtError = e as Error;
      }

      expect(caughtError).toEqual(error);
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'auth_token',
      });
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'refresh_token',
      });
    });

    it('devrait gérer les erreurs de format de session (JSON invalide)', async () => {
      const originalRequest = {
        _retry: false,
        headers: {},
        url: '/api/protected',
        method: 'GET',
      };
      const error = {
        response: { 
          status: 401,
          data: { detail: 'Token expired' },
        },
        config: originalRequest,
      };

      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          password: 'invalid-json{',
        })
        .mockResolvedValueOnce({
          password: 'valid-refresh-token',
        });

      const newAccessToken = 'new-token-from-refresh';
      mockedAxios
        .mockResolvedValueOnce({
          data: { access: newAccessToken },
        })
        .mockResolvedValueOnce({
          data: { success: true },
        });

      await responseInterceptor(error);

      const calls = mockedAxios.mock.calls;
      expect(calls[0][0]).toEqual({
        method: 'post',
        url: `${API_URL}/token/refresh/`,
        headers: { 'Content-Type': 'application/json' },
        data: { refresh: 'valid-refresh-token' },
        timeout: 10000,
      });
    });

    it('devrait gérer le refresh avec le format session et le token individuel si le format session échoue', async () => {
      const originalRequest = {
        _retry: false,
        headers: {},
        url: '/api/protected',
        method: 'GET',
      };
      const error = {
        response: { 
          status: 401,
          data: { detail: 'Token expired' },
        },
        config: originalRequest,
      };

      const mockSession = { access: 'old-token' };
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          password: JSON.stringify(mockSession),
        })
        .mockResolvedValueOnce({
          password: 'individuel-refresh-token',
        });

      const newAccessToken = 'new-token';
      mockedAxios
        .mockResolvedValueOnce({
          data: { access: newAccessToken },
        })
        .mockResolvedValueOnce({
          data: { success: true },
        });

      await responseInterceptor(error);

      const calls = mockedAxios.mock.calls;
      expect(calls[0][0]).toEqual({
        method: 'post',
        url: `${API_URL}/token/refresh/`,
        headers: { 'Content-Type': 'application/json' },
        data: { refresh: 'individuel-refresh-token' },
        timeout: 10000,
      });
    });
  });
});
