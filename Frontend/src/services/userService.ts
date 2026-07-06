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

  createUser: async (userData: CreateUserData): Promise<UserResponse> => {
    try {
      const response = await apiClient.post<UserResponse>('/users/create-member/', userData);
      return response.data;
    } catch (error) {
      console.error('[UserService] Erreur createUser:', error);
      throw new Error('Échec de la création du membre. Vérifiez les informations.');
    }
  },

  changeUserStatus: async (userId: string, status: 'active' | 'pending' | 'suspended'): Promise<UserResponse> => {
    try {
      const response = await apiClient.patch<UserResponse>(`/users/${userId}/`, { status });
      return response.data;
    } catch (error) {
      console.error(`[UserService] Erreur changeUserStatus pour ${userId}:`, error);
      throw new Error('Impossible de modifier le statut de ce membre.');
    }
  },

  validateUser: async (userId: string): Promise<UserResponse> => {
    return userService.changeUserStatus(userId, 'active');
  }
};
