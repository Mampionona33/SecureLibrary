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

  createUser: async (payload: CreateUserData & { status: string }): Promise<UserResponse> => {
    try {
      // Point sur l'URL Django : /users/register/
      const response = await apiClient.post<UserResponse>('/users/register/', payload);
      return response.data;
    } catch (error: any) {
      console.error('[UserService] Erreur createUser:', error);
      // Récupération fine de l'erreur Django (ex: email déjà utilisé)
      const serverMessage = error.response?.data?.detail || error.response?.data?.email?.[0];
      throw new Error(serverMessage || 'Impossible de créer ce membre.');
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
