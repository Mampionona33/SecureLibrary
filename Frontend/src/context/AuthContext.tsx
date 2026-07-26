import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuthStore } from '@store/useAuthStore';
import { AuthContextType } from '@types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: isLoadingAuth,
    authToken,
    isStaff,
    isPendingApproval,
    login: storeLogin,
    logout: storeLogout,
    restoreSession,
  } = useAuthStore();

  // ✅ Utiliser useRef pour éviter les appels multiples
  const hasRestored = useRef(false);

  useEffect(() => {
    if (!hasRestored.current) {
      hasRestored.current = true;
      restoreSession();
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await storeLogin(email, password);
    return { success: result.success, message: result.message };
  };

  const logout = async () => {
    await storeLogout();
  };

  const value: AuthContextType = {
    isAuthenticated,
    isStaff,
    isPendingApproval,
    isLoadingAuth,
    authToken,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};
