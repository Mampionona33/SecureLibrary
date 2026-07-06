import { apiClient } from '@api/client';
import { UserResponse, CreateUserData } from '@types/user';

const mapUserResponse = (data: any): UserResponse => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  email: data.email,
  role: data.role,
  status: data.status,
});

export const userService = {
  getAllUsers: async (): Promise<UserResponse[]> => {
    try {
      const response = await apiClient.get<any[]>('/users/');
      return response.data.map(mapUserResponse);
    } catch (error) {
      console.error('[UserService] Erreur getAllUsers:', error);
      throw new Error('Impossible de charger la liste des membres.');
    }
  },

  getUserById: async (userId: string): Promise<UserResponse> => {
    try {
      const response = await apiClient.get<any>(`/users/${userId}/`);
      return mapUserResponse(response.data);
    } catch (error) {
      console.error(`[UserService] Erreur getUserById pour ${userId}:`, error);
      throw new Error('Impossible de récupérer le profil de ce membre.');
    }
  },

  createUser: async (userData: CreateUserData): Promise<UserResponse> => {
    try {
      const payload = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        role: userData.role,
        status: userData.status,
      };
      const response = await apiClient.post<any>('/users/create-member/', payload);
      return mapUserResponse(response.data);
    } catch (error) {
      console.error('[UserService] Erreur createUser:', error);
      throw new Error('Échec de la création du membre. Vérifiez les informations.');
    }
  },

  changeUserStatus: async (userId: string, status: 'active' | 'pending' | 'suspended'): Promise<UserResponse> => {
    try {
      const response = await apiClient.patch<any>(`/users/${userId}/`, { status });
      return mapUserResponse(response.data);
    } catch (error) {
      console.error(`[UserService] Erreur changeUserStatus pour ${userId}:`, error);
      throw new Error('Impossible de modifier le statut de ce membre.');
    }
  },

  validateUser: async (userId: string): Promise<UserResponse> => {
    return userService.changeUserStatus(userId, 'active');
  }
};
