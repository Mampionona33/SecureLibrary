import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';
import { TokenResponse, UserProfileResponse } from '../types/auth';

const extractErrorMessage = (data: any, fallback: string): string => {
  if (!data || typeof data !== 'object') return fallback;
  const raw = data.detail ?? data[Object.keys(data)[0]];
  if (Array.isArray(raw)) return typeof raw[0] === 'string' ? raw[0] : fallback;
  if (typeof raw === 'string') return raw;
  return fallback;
};

export const authService = {
  async fetchUserProfile(token: string): Promise<UserProfileResponse | null> {
    try {
      const response = await fetch(`${API_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) return (await response.json()) as UserProfileResponse;
      return null;
    } catch {
      return null;
    }
  },

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshCredentials = await Keychain.getGenericPassword({ service: 'refresh_token' });
      if (!refreshCredentials?.password) return null;

      const response = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshCredentials.password }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access;
        await Keychain.setGenericPassword('user_session', newAccessToken, { service: 'auth_token' });
        return newAccessToken;
      }
      return null;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    userProfile?: UserProfileResponse;
    message?: string;
  }> {
    try {
      const tokenResponse = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        return {
          success: false,
          message: extractErrorMessage(tokenData, 'Identifiants ou e-mail incorrects.'),
        };
      }

      const tokens = tokenData as TokenResponse;

      // Stockage individuel
      await Keychain.setGenericPassword('user_session', tokens.access, { service: 'auth_token' });
      await Keychain.setGenericPassword('user_refresh', tokens.refresh, { service: 'refresh_token' });

      // Stockage session JSON
      const session = { access: tokens.access, refresh: tokens.refresh };
      await Keychain.setGenericPassword(
        'user_session',
        JSON.stringify(session),
        { service: 'user_session' }
      );

      const userProfile = await this.fetchUserProfile(tokens.access);
      if (!userProfile) {
        return {
          success: false,
          message: 'Impossible de récupérer votre profil de sécurité.',
        };
      }

      return { success: true, token: tokens.access, userProfile };
    } catch (error) {
      console.error('Erreur réseau lors du flux de login :', error);
      return {
        success: false,
        message: 'Le serveur de sécurité est injoignable. Vérifiez votre réseau.',
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: 'auth_token' });
      await Keychain.resetGenericPassword({ service: 'refresh_token' });
      await Keychain.resetGenericPassword({ service: 'user_session' });
    } catch (error) {
      console.error('Erreur nettoyage Keychain :', error);
    }
  },

  async restoreSession(): Promise<{ token: string | null; userProfile: UserProfileResponse | null }> {
    try {
      // D'abord la session JSON
      const sessionData = await Keychain.getGenericPassword({ service: 'user_session' });
      let token: string | null = null;
      if (sessionData?.password) {
        try {
          const session = JSON.parse(sessionData.password);
          if (session.access) token = session.access;
        } catch (_) {}
      }

      // Fallback individuel
      if (!token) {
        const credentials = await Keychain.getGenericPassword({ service: 'auth_token' });
        if (credentials?.password) token = credentials.password;
      }

      if (token) {
        let userProfile = await this.fetchUserProfile(token);
        if (!userProfile) {
          const renewedToken = await this.refreshAccessToken();
          if (renewedToken) {
            token = renewedToken;
            userProfile = await this.fetchUserProfile(token);
          }
        }
        if (userProfile) {
          return { token, userProfile };
        }
      }
    } catch (error) {
      console.error('Erreur de restauration session :', error);
    }
    await this.logout();
    return { token: null, userProfile: null };
  },
};
