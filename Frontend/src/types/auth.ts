/**
 * Réponse brute contenant les jetons JWT retournés par /api/auth/login/
 */
export interface TokenResponse {
  access: string;
  refresh: string;
}

/**
 * Structure du profil utilisateur retournée par l'endpoint /api/auth/me/
 */
export interface UserProfileResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
}

/**
 * Contenu et fonctions exposés par le AuthContext
 */
export interface AuthContextType {
  isAuthenticated: boolean;
  isStaff: boolean;
  isPendingApproval: boolean;
  isLoadingAuth: boolean;
  authToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}
