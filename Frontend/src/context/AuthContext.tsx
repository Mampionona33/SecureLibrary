import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService'; // Ajustez l'import si besoin avec @services/authService

// 1. Définition des types pour TypeScript
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, mdp: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Création du Provider (celui qui va englober l'application)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // true au démarrage pour vérifier le stockage

  // Vérification du token au lancement de l'application
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erreur lors de la lecture du token", error);
      } finally {
        setIsLoading(false); // L'application a fini de vérifier
      }
    };

    checkToken();
  }, []);

  // Fonction de connexion globale
  const login = async (email: string, mdp: string) => {
    await authService.login(email, mdp);
    setIsAuthenticated(true); // Met à jour l'état global
  };

  // Fonction de déconnexion globale
  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook personnalisé pour utiliser le contexte facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
