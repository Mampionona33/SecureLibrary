import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { apiClient } from '@api/client';
import axios from 'axios';
import { Platform } from 'react-native';

// 🔥 Configuration Keychain pour persistance permanente
const KEYCHAIN_OPTIONS = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  ...(Platform.OS === 'ios' && {
    accessControl: Keychain.ACCESS_CONTROL.USER_PRESENCE,
  }),
};

const KEYCHAIN_KEYS = {
  SESSION: 'user_session',
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// 🔥 Fonctions helper pour Keychain
const setToken = async (key: string, value: string) => {
  try {
    await Keychain.setGenericPassword(key, value, {
      service: key,
      ...KEYCHAIN_OPTIONS,
    });
    console.log(`✅ Token ${key} stocké`);
  } catch (error) {
    console.error(`❌ Erreur stockage ${key}:`, error);
  }
};

const getToken = async (key: string) => {
  try {
    const result = await Keychain.getGenericPassword({ service: key });
    return result;
  } catch (error) {
    console.error(`❌ Erreur récupération ${key}:`, error);
    return null;
  }
};

const resetToken = async (key: string) => {
  try {
    await Keychain.resetGenericPassword({ service: key });
    console.log(`✅ Token ${key} supprimé`);
  } catch (error) {
    console.error(`❌ Erreur suppression ${key}:`, error);
  }
};

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
          
          await AsyncStorage.removeItem(STORAGE_KEY);
          console.log('✅ AsyncStorage purgé');
          
          await resetToken(KEYCHAIN_KEYS.SESSION);
          await resetToken(KEYCHAIN_KEYS.ACCESS_TOKEN);
          await resetToken(KEYCHAIN_KEYS.REFRESH_TOKEN);
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
        
        await get().purgeStore();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        set({ isLoading: true, error: null });
        
        try {
          const freshClient = axios.create({
            baseURL: apiClient.defaults.baseURL,
            headers: { 'Content-Type': 'application/json' },
            timeout: apiClient.defaults.timeout,
          });

          const response = await freshClient.post('/users/login/', { email, password });
          const { access, refresh } = response.data;
          
          console.log('✅ Tokens obtenus');

          await resetToken(KEYCHAIN_KEYS.SESSION);
          await resetToken(KEYCHAIN_KEYS.ACCESS_TOKEN);
          await resetToken(KEYCHAIN_KEYS.REFRESH_TOKEN);
          
          await new Promise(resolve => setTimeout(resolve, 100));

          await setToken(KEYCHAIN_KEYS.ACCESS_TOKEN, access);
          await setToken(KEYCHAIN_KEYS.REFRESH_TOKEN, refresh);
          
          const session = { access, refresh };
          await setToken(KEYCHAIN_KEYS.SESSION, JSON.stringify(session));
          
          console.log('✅ Nouveaux tokens stockés');

          const verifyAccess = await getToken(KEYCHAIN_KEYS.ACCESS_TOKEN);
          const verifyRefresh = await getToken(KEYCHAIN_KEYS.REFRESH_TOKEN);
          console.log('🔍 Vérification tokens stockés:', {
            access: !!verifyAccess?.password,
            refresh: !!verifyRefresh?.password,
          });

          const userResponse = await freshClient.get('/users/me/', {
            headers: { Authorization: `Bearer ${access}` },
          });

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
          const refreshToken = await getToken(KEYCHAIN_KEYS.REFRESH_TOKEN);
          
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

          await AsyncStorage.removeItem(STORAGE_KEY);
          console.log('✅ AsyncStorage purgé');
          
          await resetToken(KEYCHAIN_KEYS.SESSION);
          await resetToken(KEYCHAIN_KEYS.ACCESS_TOKEN);
          await resetToken(KEYCHAIN_KEYS.REFRESH_TOKEN);
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
          await resetToken(KEYCHAIN_KEYS.SESSION);
          await resetToken(KEYCHAIN_KEYS.ACCESS_TOKEN);
          await resetToken(KEYCHAIN_KEYS.REFRESH_TOKEN);
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

          // 1. Récupérer les tokens
          const accessToken = await getToken(KEYCHAIN_KEYS.ACCESS_TOKEN);
          const refreshToken = await getToken(KEYCHAIN_KEYS.REFRESH_TOKEN);

          console.log('🔑 Access token trouvé:', !!accessToken?.password);
          console.log('🔑 Refresh token trouvé:', !!refreshToken?.password);

          if (!accessToken?.password) {
            console.log('⚠️ Aucun token trouvé');
            await get().purgeStore();
            set({ isLoading: false });
            return false;
          }

          // 2. Tenter de restaurer avec le token existant
          try {
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
            console.log('⚠️ Token invalide, tentative de refresh...');
            
            // 3. 🔥 Tenter de rafraîchir le token si disponible
            if (refreshToken?.password) {
              try {
                console.log('🔄 Rafraîchissement du token...');
                const refreshClient = axios.create({
                  baseURL: apiClient.defaults.baseURL,
                  headers: { 'Content-Type': 'application/json' },
                });

                const refreshResponse = await refreshClient.post('/users/login/refresh/', {
                  refresh: refreshToken.password,
                });

                if (refreshResponse.status === 200) {
                  const newAccessToken = refreshResponse.data.access;
                  
                  // 🔥 Stocker le nouveau token
                  await setToken(KEYCHAIN_KEYS.ACCESS_TOKEN, newAccessToken);
                  
                  // Mettre à jour la session
                  const session = { 
                    access: newAccessToken, 
                    refresh: refreshToken.password 
                  };
                  await setToken(KEYCHAIN_KEYS.SESSION, JSON.stringify(session));
                  
                  console.log('✅ Token rafraîchi avec succès');

                  // 🔥 Récupérer le profil avec le nouveau token
                  const userClient = axios.create({
                    baseURL: apiClient.defaults.baseURL,
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${newAccessToken}` 
                    },
                  });

                  const userResponse = await userClient.get('/users/me/');

                  if (userResponse.status === 200) {
                    const userData = userResponse.data.user || userResponse.data;
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

                    console.log('✅ Session restaurée avec nouveau token pour:', user.email);
                    console.log('👤 Rôle:', user.role);

                    set({
                      user: user,
                      authToken: newAccessToken,
                      isAuthenticated: true,
                      isStaff: isStaff,
                      isPendingApproval: user.status === 'pending',
                      isLoading: false,
                      error: null,
                    });
                    return true;
                  }
                }
              } catch (refreshError: any) {
                console.log('❌ Refresh échoué:', refreshError.response?.data || refreshError.message);
              }
            }
          }

          // 4. Si tout échoue, purger le store
          console.log('⚠️ Session invalide, purge du store');
          await get().purgeStore();
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
