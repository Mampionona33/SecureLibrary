// Frontend/src/__tests__/services/authService.test.ts

import { authService } from '@services/authService';
import { TokenResponse, UserProfileResponse } from '../types/auth';
import * as Keychain from 'react-native-keychain';

// Mocks
jest.mock('react-native-keychain');

describe('authService', () => {
  test('should login successfully', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'password';

    // Mock the fetch function
    const mockFetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        access: 'mockedToken',
        refresh: 'mockedRefreshToken',
      }),
    });

    global.fetch = mockFetch;

    // Act
    const result = await authService.login(email, password);

    // Assert
    expect(result.success).toBe(true);
    expect(result.token).toBe('mockedToken');
    expect(result.userProfile).toBeDefined();
    expect(result.message).toBeUndefined();

    // Verify that the tokens were stored in Keychain
    expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(3);
    expect(Keychain.setGenericPassword).toHaveBeenNthCalledWith(1, 'user_session', 'mockedToken', { service: 'auth_token' });
    expect(Keychain.setGenericPassword).toHaveBeenNthCalledWith(2, 'user_refresh', 'mockedRefreshToken', { service: 'refresh_token' });
    expect(Keychain.setGenericPassword).toHaveBeenNthCalledWith(3, 'user_session', JSON.stringify({ access: 'mockedToken', refresh: 'mockedRefreshToken' }), { service: 'user_session' });
  });

  // Add more test cases for other functions in authService
  test('should handle login failure when response is not ok', async () => {
    const email = 'test@example.com';
    const password = 'wrong';
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ detail: 'Invalid credentials' }),
    });
    global.fetch = mockFetch;

    const result = await authService.login(email, password);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
    expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
  });

  test('should fetch user profile successfully', async () => {
    const token = 'valid-token';
    const mockUserProfile = { id: '1', user: { email: 'test@example.com' } };
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUserProfile),
    });
    global.fetch = mockFetch;

    const result = await authService.fetchUserProfile(token);

    expect(result).toEqual(mockUserProfile);
    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/users/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  });

  test('should return null when fetchUserProfile fails', async () => {
    const token = 'invalid-token';
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
    });
    global.fetch = mockFetch;

    const result = await authService.fetchUserProfile(token);

    expect(result).toBeNull();
  });

  test('should refresh access token successfully', async () => {
    const mockRefreshToken = 'valid-refresh';
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
      password: mockRefreshToken,
    });

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        access: newAccessToken,
        refresh: newRefreshToken,
      }),
    });
    global.fetch = mockFetch;

    const result = await authService.refreshAccessToken();

    expect(result).toBe(newAccessToken);
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'user_session',
      newAccessToken,
      { service: 'auth_token' }
    );
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'user_refresh',
      newRefreshToken,
      { service: 'refresh_token' }
    );
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'user_session',
      JSON.stringify({ access: newAccessToken, refresh: newRefreshToken }),
      { service: 'user_session' }
    );
  });

  test('should return null when refresh token is missing', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(null);

    const result = await authService.refreshAccessToken();

    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('should return null when refresh request fails', async () => {
    const mockRefreshToken = 'valid-refresh';
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
      password: mockRefreshToken,
    });

    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
    });
    global.fetch = mockFetch;

    const result = await authService.refreshAccessToken();

    expect(result).toBeNull();
  });

  test('should logout and clear tokens', async () => {
    await authService.logout();

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'auth_token',
    });
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'refresh_token',
    });
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'user_session',
    });
  });

  test('should restore session from session JSON', async () => {
    const mockSession = {
      access: 'valid-access',
      refresh: 'valid-refresh',
    };
    const mockUserProfile = { id: '1', user: { email: 'test@example.com' } };

    (Keychain.getGenericPassword as jest.Mock)
      .mockResolvedValueOnce({
        password: JSON.stringify(mockSession),
      });

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUserProfile),
    });
    global.fetch = mockFetch;

    const result = await authService.restoreSession();

    expect(result.token).toBe(mockSession.access);
    expect(result.userProfile).toEqual(mockUserProfile);
  });

  test('should restore session from individual token when session JSON missing', async () => {
    const mockToken = 'valid-access';
    const mockUserProfile = { id: '1', user: { email: 'test@example.com' } };

    (Keychain.getGenericPassword as jest.Mock)
      .mockResolvedValueOnce(null) // user_session missing
      .mockResolvedValueOnce({
        password: mockToken,
      });

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockUserProfile),
    });
    global.fetch = mockFetch;

    const result = await authService.restoreSession();

    expect(result.token).toBe(mockToken);
    expect(result.userProfile).toEqual(mockUserProfile);
  });

  test('should return null when no session found', async () => {
    (Keychain.getGenericPassword as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const result = await authService.restoreSession();

    expect(result.token).toBeNull();
    expect(result.userProfile).toBeNull();
  });

  test('should try refresh if user profile fetch fails during restore', async () => {
    const mockSession = {
      access: 'old-access',
      refresh: 'valid-refresh',
    };
    const newAccessToken = 'new-access';
    const mockUserProfile = { id: '1', user: { email: 'test@example.com' } };

    (Keychain.getGenericPassword as jest.Mock)
      .mockResolvedValueOnce({
        password: JSON.stringify(mockSession),
      });

    // First fetchUserProfile fails
    const mockFetch = jest.fn()
      .mockResolvedValueOnce({ ok: false }) // profile fails
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ access: newAccessToken, refresh: 'new-refresh' }),
      }) // refresh
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserProfile),
      }); // profile after refresh

    global.fetch = mockFetch;

    // Mock Keychain refresh token retrieval
    (Keychain.getGenericPassword as jest.Mock)
      .mockResolvedValueOnce({
        password: 'valid-refresh',
      });

    const result = await authService.restoreSession();

    expect(result.token).toBe(newAccessToken);
    expect(result.userProfile).toEqual(mockUserProfile);
  });
});
