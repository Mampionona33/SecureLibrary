// src/__tests__/services/userService.test.ts
import { userService } from '@services/userService';
import { UserResponse } from '@types/user';

// Tell Jest to use the manual mock
jest.mock('@api/client');

// Import after the mock
import { apiClient } from '@api/client';

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an array of users when getAllUsers is called', async () => {
    const mockUsers: UserResponse[] = [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
    ];

    // Mock the response from the API (apiClient.get)
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: mockUsers,
    });

    const users = await userService.getAllUsers();

    expect(users).toEqual(mockUsers);
    expect(apiClient.get).toHaveBeenCalledWith('/users/');
  });

  it('should throw an error when getAllUsers encounters an error', async () => {
    const errorMessage = 'Erreur lors de la récupération des utilisateurs';

    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await expect(userService.getAllUsers()).rejects.toThrow('Impossible de charger la liste des membres.');
  });

  it('should return a single user when getUserById is called', async () => {
    const mockUser: UserResponse = { 
      id: 1, 
      name: 'John Doe', 
      email: 'john.doe@example.com' 
    };
    const userId = '1';

    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: mockUser,
    });

    const user = await userService.getUserById(userId);

    expect(user).toEqual(mockUser);
    expect(apiClient.get).toHaveBeenCalledWith(`/users/${userId}/`);
  });

  it('should create a user when createUser is called', async () => {
    const mockUser: UserResponse = { 
      id: 1, 
      name: 'John Doe', 
      email: 'john.doe@example.com' 
    };
    const payload = { 
      name: 'John Doe', 
      email: 'john.doe@example.com', 
      password: 'password123',
      status: 'active' 
    };

    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: mockUser,
    });

    const user = await userService.createUser(payload);

    expect(user).toEqual(mockUser);
    expect(apiClient.post).toHaveBeenCalledWith('/users/register/', payload);
  });
});
