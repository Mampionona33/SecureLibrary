import { apiClient } from '@api/client';
import { UserResponse, CreateUserData } from '@types/user';

export const userService = {
  getAllUsers: async (): Promise<UserResponse[]> => {
    try {
      const response = await apiClient.get<UserResponse[]>('/users/');
      return response.data;
    } catch (error) {
      console.error('[UserService] Erreur getAllUsers:', error);
      throw new Error('Impossible de charger la liste des membres.');
    }
  },

  getUserById: async (userId: string): Promise<UserResponse> => {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`[UserService] Erreur getUserById pour ${userId}:`, error);
      throw new Error('Impossible de récupérer le profil de ce membre.');
    }
  },

  getAllGroups: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>('/users/groups/');
      return response.data;
    } catch (error) {
      console.error('[UserService] Erreur getAllGroups:', error);
      throw new Error('Impossible de charger les groupes.');
    }
  },

  updateUserFull: async (userId: string, payload: any): Promise<UserResponse> => {
    try {
      const response = await apiClient.patch<UserResponse>(`/users/${userId}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`[UserService] Erreur updateUserFull pour ${userId}:`, error);
      throw new Error('Impossible de mettre à jour le membre.');
    }
  },

  changeUserStatus: async (userId: string, status: string): Promise<UserResponse> => {
    try {
      const response = await apiClient.patch<UserResponse>(`/users/${userId}/`, { status });
      return response.data;
    } catch (error) {
      console.error(`[UserService] Erreur changeUserStatus:`, error);
      throw new Error('Impossible de modifier le statut.');
    }
  },

  validateUser: async (userId: string): Promise<UserResponse> => {
    return userService.changeUserStatus(userId, 'active');
  }
};
