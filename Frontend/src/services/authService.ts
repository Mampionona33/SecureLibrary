import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Keychain from 'react-native-keychain';
import { API_URL } from '@env';
import { TokenResponse, UserProfileResponse, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractErrorMessage = (data: any, fallback: string): string => {
  if (!data || typeof data !== 'object') return fallback;
  const raw = data.detail ?? data[Object.keys(data)[0]];
  if (Array.isArray(raw)) return typeof raw[0] === 'string' ? raw[0] : fallback;
  if (typeof raw === 'string') return raw;
  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(false); 
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const fetchUserProfile = async (token: string): Promise<UserProfileResponse | null> => {
    try {
      const response = await fetch(`${API_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) return await response.json() as UserProfileResponse;
      return null;
    } catch {
      return null;
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refreshCredentials = await Keychain.getGenericPassword({ service: 'refresh_token' });
      if (!refreshCredentials || !refreshCredentials.password) return null;

      const response = await fetch(`${API_URL}/users/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshCredentials.password }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access;
        await Keychain.setGenericPassword('user_session', newAccessToken, { service: 'auth_token' });
        setAuthToken(newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkPersistedSession = async () => {
      try {
        const credentials = await Keychain.getGenericPassword({ service: 'auth_token' });
        if (credentials && credentials.password) {
          let token = credentials.password;
          let userProfile = await fetchUserProfile(token);

          if (!userProfile) {
            const renewedToken = await refreshAccessToken();
            if (renewedToken) {
              token = renewedToken;
              userProfile = await fetchUserProfile(token);
            }
          }

          if (userProfile) {
            setAuthToken(token);
            setIsStaff(userProfile.user.role === 'admin' || userProfile.user.role === 'staff');
            
            if (userProfile.user.status === 'pending') {
              setIsPendingApproval(true);
              setIsAuthenticated(false);
            } else {
              setIsPendingApproval(false);
              setIsAuthenticated(true);
            }
          } else {
            await logout();
          }
        }
      } catch (error) {
        console.error("Erreur de restauration session :", error);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkPersistedSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
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
          message: extractErrorMessage(tokenData, 'Identifiants ou e-mail incorrects.')
        };
      }

      const tokens = tokenData as TokenResponse;
      
      await Keychain.setGenericPassword('user_session', tokens.access, { service: 'auth_token' });
      await Keychain.setGenericPassword('user_refresh', tokens.refresh, { service: 'refresh_token' });
      
      setAuthToken(tokens.access);
      
      if (tokens.user) {
        setIsStaff(tokens.user.role === 'admin' || tokens.user.role === 'staff');
        if (tokens.user.status === 'pending') {
          setIsPendingApproval(true);
          setIsAuthenticated(false);
          return { success: true };
        }
      }

      const userProfile = await fetchUserProfile(tokens.access);
      if (!userProfile) {
        return {
          success: false,
          message: "Impossible de récupérer votre profil de sécurité."
        };
      }

      setIsStaff(userProfile.user.role === 'admin' || userProfile.user.role === 'staff');

      if (userProfile.user.status === 'pending') {
        setIsPendingApproval(true);
        setIsAuthenticated(false);
      } else {
        setIsPendingApproval(false);
        setIsAuthenticated(true);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur réseau lors du flux de login :', error);
      return {
        success: false,
        message: 'Le serveur de sécurité est injoignable. Vérifiez votre réseau.'
      };
    }
  };

  const logout = async () => {
    try {
      await Keychain.resetGenericPassword({ service: 'auth_token' });
      await Keychain.resetGenericPassword({ service: 'refresh_token' });
    } catch (error) {
      console.error('Erreur nettoyage Keychain :', error);
    } finally {
      setAuthToken(null);
      setIsAuthenticated(false);
      setIsStaff(false);
      setIsPendingApproval(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isStaff,
      isPendingApproval,
      isLoadingAuth,
      authToken,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return context;
};
