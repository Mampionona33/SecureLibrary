import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Keychain from 'react-native-keychain';

// Importation sécurisée de la variable d'environnement
import { API_URL } from '@env';

// Importation des types isolés
import { TokenResponse, UserProfileResponse, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🟢 Fonction utilitaire : garantit toujours une string, jamais un tableau/objet.
const extractErrorMessage = (data: any, fallback: string): string => {
  if (!data || typeof data !== 'object') return fallback;

  const raw = data.detail ?? data[Object.keys(data)[0]];

  if (Array.isArray(raw)) {
    return typeof raw[0] === 'string' ? raw[0] : fallback;
  }
  if (typeof raw === 'string') {
    return raw;
  }
  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(false); 
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const checkPersistedSession = async () => {
      try {
        const credentials = await Keychain.getGenericPassword({ service: 'auth_token' });

        if (credentials && credentials.password) {
          const token = credentials.password;
          const userProfile = await fetchUserProfile(token);

          if (userProfile && userProfile.status !== 'pending') {
            setAuthToken(token);
            setIsStaff(userProfile.role === 'admin' || userProfile.role === 'staff');
            setIsPendingApproval(false);
            setIsAuthenticated(true);
          } else {
            // Si le profil n'existe plus ou est repassé en pending entre temps, on nettoie
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

  const fetchUserProfile = async (token: string): Promise<UserProfileResponse | null> => {
    try {
      const response = await fetch(`${API_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        return await response.json() as UserProfileResponse;
      }
      return null;
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const tokenResponse = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        // 🟢 Si Django refuse (ex: statut "pending"), on extrait proprement le message.
        // L'écran Login.tsx interceptera ce texte pour effectuer la redirection manuelle.
        return {
          success: false,
          message: extractErrorMessage(tokenData, 'Identifiants ou e-mail incorrects.')
        };
      }

      const tokens = tokenData as TokenResponse;
      const userProfile = await fetchUserProfile(tokens.access);

      if (!userProfile) {
        return {
          success: false,
          message: "Impossible de récupérer votre profil de sécurité."
        };
      }

      // Sécurité additionnelle au cas où le backend renverrait un profil en attente
      if (userProfile.status === 'pending') {
        return {
          success: false,
          message: "Votre compte est en attente de validation par un administrateur."
        };
      }

      // Workflow standard pour un utilisateur actif validé
      const isUserAdmin = userProfile.role === 'admin';
      const isUserStaff = userProfile.role === 'staff' || isUserAdmin;

      await Keychain.setGenericPassword('user_session', tokens.access, { service: 'auth_token' });
      await Keychain.setGenericPassword('user_refresh', tokens.refresh, { service: 'refresh_token' });

      setAuthToken(tokens.access);
      setIsStaff(isUserStaff);
      setIsPendingApproval(false);
      setIsAuthenticated(true);

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
