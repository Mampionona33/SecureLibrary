import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { apiClient } from '@api/client';
import axios from 'axios'; // 👈 Ajouter pour créer une instance fraîche

// 👈 IMPORTANT: Utiliser les MÊMES clés que l'intercepteur
const KEYCHAIN_KEYS = {
  SESSION: 'user_session',
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  groups_list?: any[];
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authToken: string | null;
  isStaff: boolean;
  isPendingApproval: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  clearError: () => void;
  purgeStore: () => Promise<void>;
}

const STORAGE_KEY = 'auth-storage';

const persistConfig = {
  name: STORAGE_KEY,
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state: AuthState) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isStaff: state.isStaff,
    isPendingApproval: state.isPendingApproval,
  }),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      authToken: null,
      isStaff: false,
      isPendingApproval: false,

      purgeStore: async () => {
        try {
          console.log('🧹 Début de la purge du store...');
          
          // Supprimer AsyncStorage
          await AsyncStorage.removeItem(STORAGE_KEY);
          console.log('✅ AsyncStorage purgé');
          
          // 🔥 Supprimer TOUS les tokens Keychain avec les bonnes clés
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
          console.log('✅ Keychain purgé');

          set({
            user: null,
            authToken: null,
            isAuthenticated: false,
            isStaff: false,
            isPendingApproval: false,
            isLoading: false,
            error: null,
          });

          console.log('🧹 Store purgé avec succès');
          
        } catch (error) {
          console.error('❌ Erreur purgeStore:', error);
          set({
            user: null,
            authToken: null,
            isAuthenticated: false,
            isStaff: false,
            isPendingApproval: false,
            isLoading: false,
            error: null,
          });
        }
      },

      login: async (email, password) => {
        console.log('🔐 Tentative de login pour:', email);
        
        // Purger complètement avant tout login
        await get().purgeStore();
        
        // Attendre que la purge soit complète
        await new Promise(resolve => setTimeout(resolve, 300));
        
        set({ isLoading: true, error: null });
        
        try {
          // 🔥 CRÉER UNE INSTANCE FRAÎCHE D'AXIOS (sans intercepteurs)
          const freshClient = axios.create({
            baseURL: apiClient.defaults.baseURL,
            headers: { 'Content-Type': 'application/json' },
            timeout: apiClient.defaults.timeout,
          });

          // 1. Login - obtenir les tokens avec l'instance fraîche
          const response = await freshClient.post('/users/login/', { email, password });
          const { access, refresh } = response.data;
          
          console.log('✅ Tokens obtenus');

          // 2. 🔥 SUPPRIMER TOUT avant de stocker les nouveaux
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
          
          await new Promise(resolve => setTimeout(resolve, 100));

          // 3. Stocker les NOUVEAUX tokens avec les bonnes clés
          await Keychain.setGenericPassword(KEYCHAIN_KEYS.ACCESS_TOKEN, access, { 
            service: KEYCHAIN_KEYS.ACCESS_TOKEN 
          });
          await Keychain.setGenericPassword(KEYCHAIN_KEYS.REFRESH_TOKEN, refresh, { 
            service: KEYCHAIN_KEYS.REFRESH_TOKEN 
          });
          
          // Stocker aussi en session pour compatibilité
          const session = { access, refresh };
          await Keychain.setGenericPassword(KEYCHAIN_KEYS.SESSION, JSON.stringify(session), { 
            service: KEYCHAIN_KEYS.SESSION 
          });
          
          console.log('✅ Nouveaux tokens stockés dans Keychain');

          // 4. 🔥 VÉRIFIER que le token est bien stocké
          const verifyToken = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
          console.log('🔍 Vérification token stocké:', !!verifyToken?.password);

          // 5. Récupérer le profil avec l'instance FRAÎCHE
          const userResponse = await freshClient.get('/users/me/', {
            headers: { Authorization: `Bearer ${access}` },
          });

          // 6. Extraire l'utilisateur
          const userData = userResponse.data.user || userResponse.data;
          
          const user = {
            id: userData.id || '',
            email: userData.email || email,
            firstName: userData.firstName || userData.first_name || '',
            lastName: userData.lastName || userData.last_name || '',
            role: userData.role || 'user',
            status: userData.status || 'active',
            is_staff: userData.is_staff || false,
            is_superuser: userData.is_superuser || false,
            groups_list: userData.groups_list || [],
            ...userData,
          };

          const isStaff = user.role === 'admin' || user.role === 'staff' || user.is_staff === true;

          console.log('📝 Nouvel utilisateur:', {
            email: user.email,
            role: user.role,
            isStaff: isStaff,
          });

          // 7. Mettre à jour le state
          set({
            user: user,
            authToken: access,
            isAuthenticated: true,
            isStaff: isStaff,
            isPendingApproval: user.status === 'pending',
            isLoading: false,
            error: null,
          });

          console.log('✅ Utilisateur connecté:', user.email);
          console.log('👤 Rôle:', user.role);
          console.log('👤 isStaff:', isStaff);
          
          return { success: true };

        } catch (error: any) {
          console.error('❌ Erreur login:', error);
          
          // En cas d'erreur, purger le store
          await get().purgeStore();
          
          const message = error.response?.data?.detail || 'Identifiants incorrects';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: async () => {
        console.log('🔓 Début de la déconnexion...');
        set({ isLoading: true });
        
        try {
          const refreshToken = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
          
          if (refreshToken?.password) {
            try {
              console.log('📤 Envoi du refresh token pour blacklist...');
              await apiClient.post('/users/logout/', { 
                refresh: refreshToken.password 
              });
              console.log('✅ Token blacklisté avec succès');
            } catch (apiError: any) {
              console.warn('⚠️ Échec de l\'appel logout API:', apiError.response?.data || apiError.message);
            }
          }

          // ✅ ORDRE CRITIQUE
          await AsyncStorage.removeItem(STORAGE_KEY);
          console.log('✅ AsyncStorage purgé');
          
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
          console.log('✅ Keychain purgé');

          set({
            user: null,
            authToken: null,
            isAuthenticated: false,
            isStaff: false,
            isPendingApproval: false,
            isLoading: false,
            error: null,
          });

          console.log('🔓 Utilisateur déconnecté avec succès');
          
        } catch (error) {
          console.error('❌ Erreur logout:', error);
          await AsyncStorage.removeItem(STORAGE_KEY);
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.SESSION });
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
          await Keychain.resetGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });
          set({
            user: null,
            authToken: null,
            isAuthenticated: false,
            isStaff: false,
            isPendingApproval: false,
            isLoading: false,
            error: null,
          });
        }
      },

      restoreSession: async () => {
        try {
          console.log('🔄 Restauration de la session...');
          set({ isLoading: true, error: null });

          const accessToken = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.ACCESS_TOKEN });
          const refreshToken = await Keychain.getGenericPassword({ service: KEYCHAIN_KEYS.REFRESH_TOKEN });

          console.log('🔑 Access token trouvé:', !!accessToken?.password);
          console.log('🔑 Refresh token trouvé:', !!refreshToken?.password);

          if (!accessToken?.password) {
            console.log('⚠️ Aucun token trouvé');
            await get().purgeStore();
            set({ isLoading: false });
            return false;
          }

          try {
            // Créer une instance fraîche pour la restauration
            const freshClient = axios.create({
              baseURL: apiClient.defaults.baseURL,
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken.password}` 
              },
            });

            const response = await freshClient.get('/users/me/');

            if (response.status === 200) {
              const userData = response.data.user || response.data;
              const user = {
                id: userData.id || '',
                email: userData.email || '',
                firstName: userData.firstName || userData.first_name || '',
                lastName: userData.lastName || userData.last_name || '',
                role: userData.role || 'user',
                status: userData.status || 'active',
                is_staff: userData.is_staff || false,
                is_superuser: userData.is_superuser || false,
                groups_list: userData.groups_list || [],
                ...userData,
              };

              const isStaff = user.role === 'admin' || user.role === 'staff' || user.is_staff === true;

              console.log('✅ Session restaurée pour:', user.email);
              console.log('👤 Rôle:', user.role);

              set({
                user: user,
                authToken: accessToken.password,
                isAuthenticated: true,
                isStaff: isStaff,
                isPendingApproval: user.status === 'pending',
                isLoading: false,
                error: null,
              });
              return true;
            }
          } catch (error: any) {
            console.log('⚠️ Token invalide');
            await get().purgeStore();
          }

          set({ isLoading: false });
          return false;

        } catch (error) {
          console.error('❌ Erreur restoreSession:', error);
          await get().purgeStore();
          set({ isLoading: false, error: 'Erreur lors de la restauration' });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    persistConfig
  )
);
