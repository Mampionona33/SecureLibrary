import * as Keychain from 'react-native-keychain';
import axios from 'axios';
import { 
  requestInterceptor, 
  requestErrorInterceptor,
  responseInterceptor,
  responseSuccessInterceptor 
} from '@api/interceptors';
import { API_URL } from '@env';

// Mocks
jest.mock('react-native-keychain');

// Mock d'axios - version simplifiée sans mockReset
jest.mock('axios', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedAxios = axios as jest.MockedFunction<typeof axios>;

jest.mock('@env', () => ({
  API_URL: 'http://test-api.com/api',
}));

describe('API Interceptors - Tests Complets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Réinitialiser le mock axios
    (mockedAxios as jest.Mock).mockReset();
  });

  // ==================== REQUEST INTERCEPTOR ====================
  describe('requestInterceptor', () => {
    it('devrait ajouter le token d\'autorisation depuis le format session (JSON)', async () => {
      // Arrange
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

      // Act
      const result = await requestInterceptor(config);

      // Assert
      expect(result.headers.Authorization).toBe(`Bearer ${mockSession.access}`);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'user_session',
      });
    });

    it('devrait utiliser le token individuel si le format session échoue', async () => {
      // Arrange
      const mockToken = 'mock-access-token-789';
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce(false) // user_session échoue
        .mockResolvedValueOnce({ password: mockToken }); // auth_token fonctionne

      // Act
      const result = await requestInterceptor(config);

      // Assert
      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'auth_token',
      });
    });

    it('devrait gérer le cas où le token est un string brut dans user_session', async () => {
      // Arrange
      const mockToken = 'raw-token-string';
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: mockToken, // Pas du JSON
      });

      // Act
      const result = await requestInterceptor(config);

      // Assert
      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('ne devrait pas ajouter d\'autorisation si aucun token n\'existe', async () => {
      // Arrange
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await requestInterceptor(config);

      // Assert
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('devrait gérer les erreurs Keychain sans planter', async () => {
      // Arrange
      const config = { 
        headers: {},
        url: '/test',
        method: 'GET',
      };

      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error')
      );

      // Act
      const result = await requestInterceptor(config);

      // Assert
      expect(result.headers.Authorization).toBeUndefined();
      expect(result).toEqual(config);
    });
  });

  // ==================== REQUEST ERROR INTERCEPTOR ====================
  describe('requestErrorInterceptor', () => {
    it('devrait rejeter l\'erreur telle quelle', async () => {
      // Arrange
      const error = new Error('Request failed');

      // Act & Assert
      await expect(requestErrorInterceptor(error)).rejects.toEqual(error);
    });
  });

  // ==================== RESPONSE SUCCESS INTERCEPTOR ====================
  describe('responseSuccessInterceptor', () => {
    it('devrait retourner la réponse inchangée', () => {
      // Arrange
      const response = {
        data: { success: true },
        status: 200,
        config: { url: '/test' },
      };

      // Act
      const result = responseSuccessInterceptor(response);

      // Assert
      expect(result).toEqual(response);
    });
  });

  // ==================== RESPONSE INTERCEPTOR ====================
  describe('responseInterceptor - Token Refresh', () => {
    it('devrait rafraîchir le token et réessayer la requête en cas de 401', async () => {
      // Arrange
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

      // Mock Keychain pour récupérer la session
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        password: JSON.stringify(mockSession),
      });

      // Mock axios pour le refresh (premier appel)
      (mockedAxios as jest.Mock).mockResolvedValueOnce({
        data: { access: newAccessToken },
      });

      // Mock axios pour la requête retentée (deuxième appel)
      (mockedAxios as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
        status: 200,
      });

      // Act
      try {
        await responseInterceptor(error);
      } catch (e) {
        // Attendu
      }

      // Assert
      // Vérifier que le refresh a été appelé
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'post',
        url: `${API_URL}/users/token/refresh/`,
        headers: { 'Content-Type': 'application/json' },
        data: { refresh: mockSession.refresh },
        timeout: 10000,
      });

      // Vérifier que la session a été mise à jour
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        JSON.stringify({
          access: newAccessToken,
          refresh: mockSession.refresh,
        }),
        { service: 'user_session' }
      );

      // Vérifier que la requête a été retentée
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${newAccessToken}`,
          }),
        })
      );
    });

    it('devrait nettoyer les tokens si le refresh échoue', async () => {
      // Arrange
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

      // Le refresh échoue
      const refreshError = new Error('Refresh token expired');
      (mockedAxios as jest.Mock).mockRejectedValueOnce(refreshError);

      // Act
      let caughtError: Error | null = null;
      try {
        await responseInterceptor(error);
      } catch (e) {
        caughtError = e as Error;
      }

      // Assert
      expect(caughtError).toBe(refreshError);
      
      // Vérifier que les tokens sont nettoyés
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
      // Arrange
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

      // Act & Assert
      await expect(responseInterceptor(error)).rejects.toEqual(error);
      expect(Keychain.getGenericPassword).not.toHaveBeenCalled();
      expect(mockedAxios).not.toHaveBeenCalled();
    });

    it('devrait nettoyer les tokens si aucun refresh token n\'est disponible', async () => {
      // Arrange
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

      // Aucun token en session
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      // Act
      let caughtError: Error | null = null;
      try {
        await responseInterceptor(error);
      } catch (e) {
        caughtError = e as Error;
      }

      // Assert
      expect(caughtError).toEqual(error);
      
      // Vérifier que les tokens sont nettoyés
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
      // Arrange
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

      // Le refresh retourne une réponse sans access token
      (mockedAxios as jest.Mock).mockResolvedValueOnce({
        data: { refresh: 'new-refresh' }, // Pas de access token
      });

      // Act
      let caughtError: Error | null = null;
      try {
        await responseInterceptor(error);
      } catch (e) {
        caughtError = e as Error;
      }

      // Assert
      expect(caughtError).toEqual(error);
      
      // Vérifier que les tokens sont nettoyés
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
      // Arrange
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

      // Session avec JSON invalide
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          password: 'invalid-json{',
        })
        .mockResolvedValueOnce({
          password: 'valid-refresh-token',
        });

      const newAccessToken = 'new-token-from-refresh';
      (mockedAxios as jest.Mock)
        .mockResolvedValueOnce({
          data: { access: newAccessToken },
        })
        .mockResolvedValueOnce({
          data: { success: true },
        });

      // Act
      try {
        await responseInterceptor(error);
      } catch (e) {
        // Attendu
      }

      // Assert - vérifier que le refresh a été tenté avec le token individuel
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'post',
        url: `${API_URL}/users/token/refresh/`,
        headers: { 'Content-Type': 'application/json' },
        data: { refresh: 'valid-refresh-token' },
        timeout: 10000,
      });
    });

    it('devrait gérer le refresh avec le format session et le token individuel si le format session échoue', async () => {
      // Arrange
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

      // Session existe mais n'a pas de refresh
      const mockSession = { access: 'old-token' };
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          password: JSON.stringify(mockSession),
        })
        .mockResolvedValueOnce({
          password: 'individuel-refresh-token',
        });

      const newAccessToken = 'new-token';
      (mockedAxios as jest.Mock)
        .mockResolvedValueOnce({
          data: { access: newAccessToken },
        })
        .mockResolvedValueOnce({
          data: { success: true },
        });

      // Act
      try {
        await responseInterceptor(error);
      } catch (e) {
        // Attendu
      }

      // Assert - vérifier que le refresh a été tenté avec le token individuel
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'post',
        url: `${API_URL}/users/token/refresh/`,
        headers: { 'Content-Type': 'application/json' },
        data: { refresh: 'individuel-refresh-token' },
        timeout: 10000,
      });
    });
  });
});
