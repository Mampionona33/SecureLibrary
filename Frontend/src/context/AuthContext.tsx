import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isStaff: boolean;
  isPendingApproval: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isPendingApproval, setIsPendingApproval] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Vérifier s'il y a déjà un Token JWT stocké lors de l'ouverture de l'app
  useEffect(() => {
    const checkToken = async () => {
      // Pour l'instant, on simule un chargement rapide (1 seconde)
      setTimeout(() => {
        setIsLoadingAuth(false);
      }, 1000);
    };

    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Tentative de connexion avec :", email);
  
    // Active la simulation en décommentant cette ligne :
    setIsAuthenticated(true); 
  
    // Tu peux aussi tester le rôle Admin en passant ceci à true si tu veux voir l'AdminStack :
    // setIsStaff(true);
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setIsStaff(false);
    setIsPendingApproval(false);
    // Plus tard : supprimer le JWT localement
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isStaff,
        isPendingApproval,
        isLoadingAuth,
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
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
