import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { apiClient } from '@api/client';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  status?: string;
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      authToken: null,
      isStaff: false,
      isPendingApproval: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/users/login/', { email, password });
          const { access, refresh, user } = response.data;

          await Keychain.setGenericPassword('access_token', access, { service: 'auth_token' });
          await Keychain.setGenericPassword('refresh_token', refresh, { service: 'refresh_token' });

          set({
            user,
            authToken: access,
            isAuthenticated: true,
            isStaff: user.role === 'admin' || user.role === 'staff',
            isPendingApproval: user.status === 'pending',
            isLoading: false,
            error: null,
          });

          console.log('✅ Utilisateur connecté:', user.email);
          return { success: true };

        } catch (error: any) {
          console.error('❌ Erreur login:', error);
          const message = error.response?.data?.detail || 'Identifiants incorrects';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await Keychain.resetGenericPassword({ service: 'auth_token' });
          await Keychain.resetGenericPassword({ service: 'refresh_token' });

          set({
            user: null,
            authToken: null,
            isAuthenticated: false,
            isStaff: false,
            isPendingApproval: false,
            isLoading: false,
            error: null,
          });

          console.log('🔓 Utilisateur déconnecté');
        } catch (error) {
          console.error('❌ Erreur logout:', error);
          set({ isLoading: false });
        }
      },

      restoreSession: async () => {
        try {
          set({ isLoading: true, error: null });

          const accessToken = await Keychain.getGenericPassword({ service: 'auth_token' });
          const refreshToken = await Keychain.getGenericPassword({ service: 'refresh_token' });

          if (accessToken?.password) {
            try {
              const response = await apiClient.get('/users/me/', {
                headers: { Authorization: `Bearer ${accessToken.password}` },
              });

              if (response.status === 200) {
                const user = response.data;
                set({
                  user,
                  authToken: accessToken.password,
                  isAuthenticated: true,
                  isStaff: user.role === 'admin' || user.role === 'staff',
                  isPendingApproval: user.status === 'pending',
                  isLoading: false,
                  error: null,
                });
                console.log('✅ Session restaurée');
                return true;
              }
            } catch (error: any) {
              if (error.response?.status === 401 && refreshToken?.password) {
                try {
                  const refreshResponse = await apiClient.post('/token/refresh/', {
                    refresh: refreshToken.password,
                  });

                  if (refreshResponse.status === 200) {
                    const newAccessToken = refreshResponse.data.access;
                    await Keychain.setGenericPassword('access_token', newAccessToken, { service: 'auth_token' });

                    const userResponse = await apiClient.get('/users/me/', {
                      headers: { Authorization: `Bearer ${newAccessToken}` },
                    });

                    if (userResponse.status === 200) {
                      const user = userResponse.data;
                      set({
                        user,
                        authToken: newAccessToken,
                        isAuthenticated: true,
                        isStaff: user.role === 'admin' || user.role === 'staff',
                        isPendingApproval: user.status === 'pending',
                        isLoading: false,
                        error: null,
                      });
                      console.log('✅ Token rafraîchi');
                      return true;
                    }
                  }
                } catch (refreshError) {
                  console.log('❌ Refresh échoué');
                }
              }
            }
          }

          set({ isLoading: false });
          return false;

        } catch (error) {
          console.error('❌ Erreur restoreSession:', error);
          set({ isLoading: false, error: 'Erreur lors de la restauration' });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isStaff: state.isStaff,
        isPendingApproval: state.isPendingApproval,
      }),
    }
  )
);
