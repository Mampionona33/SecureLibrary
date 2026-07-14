import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const checkPersistedSession = async () => {
      try {
        const { token, userProfile } = await authService.restoreSession();

        if (userProfile && token) {
          setAuthToken(token);
          setIsStaff(userProfile.user.role === 'admin' || userProfile.user.role === 'staff');
          setIsPendingApproval(userProfile.user.status === 'pending');
          setIsAuthenticated(userProfile.user.status !== 'pending');
        }
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkPersistedSession();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.token && result.userProfile) {
      setAuthToken(result.token);
      setIsStaff(result.userProfile.user.role === 'admin' || result.userProfile.user.role === 'staff');
      setIsPendingApproval(result.userProfile.user.status === 'pending');
      setIsAuthenticated(result.userProfile.user.status !== 'pending');
    }
    return { success: result.success, message: result.message };
  };

  const logout = async () => {
    await authService.logout();
    setAuthToken(null);
    setIsAuthenticated(false);
    setIsStaff(false);
    setIsPendingApproval(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isStaff,
        isPendingApproval,
        isLoadingAuth,
        authToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};
