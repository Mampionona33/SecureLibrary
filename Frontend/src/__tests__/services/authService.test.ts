import * as Keychain from 'react-native-keychain';
import { authService } from '@services/authService';

// 1. Mock de l'environnement
jest.mock('@env', () => ({
  API_URL: 'http://localhost:8000/api',
}));

// 2. Mock de Keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should store tokens in Keychain on successful login', async () => {
      const mockUserProfile = {
        user: { id: 1, email: 'test@example.com', role: 'reader', status: 'active' },
      };

      // Mock des 2 appels fetch successifs : 1) /users/login/ 2) /users/me/
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access: 'test-access-token',
            refresh: 'test-refresh-token',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserProfile,
        }) as jest.Mock;

      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(result.token).toBe('test-access-token');
      expect(result.userProfile).toEqual(mockUserProfile);
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        'test-access-token',
        { service: 'auth_token' }
      );
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_refresh',
        'test-refresh-token',
        { service: 'refresh_token' }
      );
    });

    test('should return error on failed login response', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid credentials' }),
      }) as jest.Mock;

      const result = await authService.login('test@example.com', 'wrong-password');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
    });

    test('should handle network errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error')) as jest.Mock;

      const result = await authService.login('test@example.com', 'password');

      expect(result.success).toBe(false);
      expect(result.message).toContain('serveur de sécurité est injoignable');
    });

    test('should return error if user profile fetch fails', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access: 'test-token',
            refresh: 'refresh-token',
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        }) as jest.Mock;

      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password');

      expect(result.success).toBe(false);
      expect(result.message).toContain('profil de sécurité');
    });
  });

  describe('logout', () => {
    test('should clear both auth and refresh tokens from Keychain', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

      await authService.logout();

      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({ service: 'auth_token' });
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({ service: 'refresh_token' });
    });

    test('should handle Keychain errors gracefully', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValue(new Error('Keychain error'));

      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('fetchUserProfile', () => {
    test('should fetch and return user profile for valid token', async () => {
      const mockProfile = {
        user: { id: 1, email: 'test@example.com', role: 'reader', status: 'active' },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      }) as jest.Mock;

      const result = await authService.fetchUserProfile('valid-token');

      expect(result).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/me/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });

    test('should return null on failed profile fetch', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      }) as jest.Mock;

      const result = await authService.fetchUserProfile('invalid-token');

      expect(result).toBeNull();
    });

    test('should return null on network error', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error')) as jest.Mock;

      const result = await authService.fetchUserProfile('token');

      expect(result).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    test('should refresh token and store new one in Keychain', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: 'old-refresh-token',
      });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access: 'new-access-token' }),
      }) as jest.Mock;

      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.refreshAccessToken();

      expect(result).toBe('new-access-token');
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'user_session',
        'new-access-token',
        { service: 'auth_token' }
      );
    });

    test('should return null if no refresh token exists', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(null);

      const result = await authService.refreshAccessToken();

      expect(result).toBeNull();
    });

    test('should return null on refresh failure', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: 'refresh-token',
      });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      }) as jest.Mock;

      const result = await authService.refreshAccessToken();

      expect(result).toBeNull();
    });
  });

  describe('restoreSession', () => {
    test('should restore session with valid stored token', async () => {
      const mockProfile = {
        user: { id: 1, email: 'test@example.com', role: 'admin', status: 'active' },
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: 'stored-token',
      });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      }) as jest.Mock;

      const result = await authService.restoreSession();

      expect(result.token).toBe('stored-token');
      expect(result.userProfile).toEqual(mockProfile);
    });

    test('should return null if no stored token exists', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(null);

      const result = await authService.restoreSession();

      expect(result.token).toBeNull();
      expect(result.userProfile).toBeNull();
    });

    test('should refresh token if stored token is invalid', async () => {
      const mockProfile = {
        user: { id: 1, email: 'test@example.com', role: 'reader', status: 'active' },
      };

      // 1. getGenericPassword(auth_token) -> expired-token
      // 2. getGenericPassword(refresh_token) dans refreshAccessToken -> refresh-token
      (Keychain.getGenericPassword as jest.Mock)
        .mockResolvedValueOnce({ password: 'expired-token' })
        .mockResolvedValueOnce({ password: 'refresh-token' });

      // 1. fetchUserProfile(expired-token) -> fail (ok: false)
      // 2. refreshAccessToken -> success (ok: true)
      // 3. fetchUserProfile(new-token) -> success (ok: true)
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access: 'new-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfile,
        }) as jest.Mock;

      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.restoreSession();

      expect(result.token).toBe('new-token');
      expect(result.userProfile).toEqual(mockProfile);
    });
  });
});
