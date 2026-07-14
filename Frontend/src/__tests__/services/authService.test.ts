import * as Keychain from 'react-native-keychain';
import { authService } from '@services/authService';
import { API_URL } from '@env';

// Mocks
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

jest.mock('@env', () => ({
  API_URL: 'http://test-api.com/api',
}));

// Mock global fetch
global.fetch = jest.fn();

describe('authService - TDD Token Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login - Token Storage', () => {
    it('doit stocker les tokens dans les deux formats (session et individuel)', async () => {
      // Arrange
      const mockTokens = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      };
      const mockUserProfile = {
        id: '1',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'reader',
          status: 'active',
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockUserProfile),
        });

      // Act
      const result = await authService.login('test@example.com', 'password123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.token).toBe(mockTokens.access);

      // Vérifier que le token est stocké au format session (JSON)
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        JSON.stringify({
          access: mockTokens.access,
          refresh: mockTokens.refresh,
        }),
        { service: 'user_session' }
      );

      // Vérifier que le token est stocké individuellement pour compatibilité
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        mockTokens.access,
        { service: 'auth_token' }
      );
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        mockTokens.refresh,
        { service: 'refresh_token' }
      );
    });

    it('doit échouer si le profil utilisateur ne peut pas être récupéré', async () => {
      // Arrange
      const mockTokens = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      // Act
      const result = await authService.login('test@example.com', 'password123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('profil de sécurité');
      
      // Vérifier qu'aucun token n'est stocké si le profil échoue
      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
    });
  });

  describe('restoreSession - Token Recovery', () => {
    it('doit restaurer la session depuis le format session (JSON)', async () => {
      // Arrange
      const mockSession = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      };
      const mockUserProfile = {
        id: '1',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'reader',
          status: 'active',
        },
      };

      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          password: JSON.stringify(mockSession),
        });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserProfile),
      });

      // Act
      const result = await authService.restoreSession();

      // Assert
      expect(result.token).toBe(mockSession.access);
      expect(result.userProfile).toEqual(mockUserProfile);
    });

    it('doit essayer le format individuel si le format session échoue', async () => {
      // Arrange
      const mockToken = 'mock-access-token';
      const mockUserProfile = {
        id: '1',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'reader',
          status: 'active',
        },
      };

      // Le format session échoue
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce(false) // user_session échoue
        .mockResolvedValueOnce({ // auth_token fonctionne
          password: mockToken,
        });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserProfile),
      });

      // Act
      const result = await authService.restoreSession();

      // Assert
      expect(result.token).toBe(mockToken);
      expect(result.userProfile).toEqual(mockUserProfile);
    });

    it('doit retourner null si aucun token n\'est trouvé', async () => {
      // Arrange
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValue(false);

      // Act
      const result = await authService.restoreSession();

      // Assert
      expect(result.token).toBe(null);
      expect(result.userProfile).toBe(null);
    });
  });

  describe('logout - Token Cleanup', () => {
    it('doit supprimer tous les tokens de tous les services', async () => {
      // Act
      await authService.logout();

      // Assert
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

    it('doit gérer les erreurs sans les propager', async () => {
      // Arrange
      (Keychain.resetGenericPassword as jest.Mock)
        .mockRejectedValueOnce(new Error('Keychain error'));

      // Act
      let error: Error | null = null;
      try {
        await authService.logout();
      } catch (e) {
        error = e as Error;
      }

      // Assert
      expect(error).toBeNull();
    });
  });

  describe('refreshAccessToken - Token Refresh', () => {
    it('doit rafraîchir le token en utilisant le format session', async () => {
      // Arrange
      const mockSession = {
        access: 'old-access-token',
        refresh: 'valid-refresh-token',
      };
      const newAccessToken = 'new-access-token';

      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({
          password: JSON.stringify(mockSession),
        });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access: newAccessToken,
        }),
      });

      // Act
      const result = await authService.refreshAccessToken();

      // Assert
      expect(result).toBe(newAccessToken);
      
      // Vérifier que la session est mise à jour
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        JSON.stringify({
          access: newAccessToken,
          refresh: mockSession.refresh,
        }),
        { service: 'user_session' }
      );
    });

    it('doit utiliser le refresh_token individuel si le format session échoue', async () => {
      // Arrange
      const mockRefreshToken = 'valid-refresh-token';
      const newAccessToken = 'new-access-token';

      // Le format session échoue
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce(false) // user_session
        .mockResolvedValueOnce({ // refresh_token
          password: mockRefreshToken,
        });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          access: newAccessToken,
        }),
      });

      // Act
      const result = await authService.refreshAccessToken();

      // Assert
      expect(result).toBe(newAccessToken);
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        newAccessToken,
        { service: 'auth_token' }
      );
    });

    it('doit retourner null si aucun refresh token n\'existe', async () => {
      // Arrange
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValue(false);

      // Act
      const result = await authService.refreshAccessToken();

      // Assert
      expect(result).toBe(null);
    });
  });
});
