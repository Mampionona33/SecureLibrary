import { create } from 'zustand';
import { userService } from '@services/userService';
import { UserResponse } from '@types/user';

interface UserState {
  users: UserResponse[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  
  // Actions
  fetchUsers: (isRefresh?: boolean) => Promise<void>;
  updateUserInStore: (userId: string, payload: any) => Promise<void>;
  validateUserInStore: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  refreshing: false,
  error: null,

  fetchUsers: async (isRefresh = false) => {
    if (isRefresh) set({ refreshing: true });
    else set({ loading: true, error: null });

    try {
      const data = await userService.getAllUsers();
      set({ users: data, loading: false, refreshing: false });
    } catch (err: any) {
      set({ error: err.message || 'Erreur de chargement', loading: false, refreshing: false });
    }
  },

  updateUserInStore: async (userId: string, payload: any) => {
    try {
      const updatedUser = await userService.updateUserFull(userId, payload);
      const updatedUsers = get().users.map((u) => (u.id === userId ? updatedUser : u));
      set({ users: updatedUsers });
    } catch (err: any) {
      throw err;
    }
  },

  validateUserInStore: async (userId: string) => {
    try {
      // 1. Appel API Django
      const updatedUser = await userService.validateUser(userId);
      
      // 2. Synchro de la liste en mémoire locale
      const updatedUsers = get().users.map((u) => (u.id === userId ? updatedUser : u));
      set({ users: updatedUsers });
    } catch (err: any) {
      throw err;
    }
  },
}));
