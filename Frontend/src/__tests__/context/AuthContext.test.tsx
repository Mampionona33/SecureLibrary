import React from 'react';
import { Text } from 'react-native';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';

// Mock the authService BEFORE importing the component
jest.mock('@services/authService', () => {
  const mockRestoreSession = jest.fn().mockResolvedValue({ token: null, userProfile: null });
  const mockLogin = jest.fn().mockResolvedValue({
    success: true,
    token: 'mock-token',
    userProfile: {
      user: {
        id: '1',
        username: 'test',
        role: 'reader',
        status: 'active'
      }
    },
    message: 'Login successful'
  });
  const mockLogout = jest.fn().mockResolvedValue(undefined);

  const authService = {
    restoreSession: mockRestoreSession,
    login: mockLogin,
    logout: mockLogout,
  };

  return {
    __esModule: true,
    default: authService,
    authService: authService,
  };
});

// Mock Keychain
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn().mockResolvedValue(false),
  setGenericPassword: jest.fn().mockResolvedValue(true),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));

jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

// Now import the component
import { AuthProvider, useAuth } from '@context/AuthContext';
import { authService } from '@services/authService';

// Get the mocked functions
const mockRestoreSession = authService.restoreSession as jest.Mock;
const mockLogin = authService.login as jest.Mock;
const mockLogout = authService.logout as jest.Mock;

const mockedKeychain = Keychain as jest.Mocked<typeof Keychain>;

// Simple test component
const SimpleTestComponent = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <Text testID="loading">Loading...</Text>;
  }

  return (
    <Text testID="status">
      {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
    </Text>
  );
};

describe('AuthProvider', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementations - ALWAYS return an object
    mockRestoreSession.mockResolvedValue({ token: null, userProfile: null });
    mockLogin.mockResolvedValue({
      success: true,
      token: 'mock-token',
      userProfile: {
        user: {
          id: '1',
          username: 'test',
          role: 'reader',
          status: 'active'
        }
      },
      message: 'Login successful'
    });
    mockLogout.mockResolvedValue(undefined);
  });

  // Clean up after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <Text>Provider Works</Text>
        </AuthProvider>
      );
    });

    expect(screen.getByText('Provider Works')).toBeTruthy();
  });

  it('AuthProvider initializes with isAuthenticated as false', async () => {
    // Return empty object (no token, no user)
    mockRestoreSession.mockResolvedValue({ token: null, userProfile: null });

    await act(async () => {
      render(
        <AuthProvider>
          <SimpleTestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('Not Authenticated');
    });
  });

  it('handles pending approval status correctly', async () => {
    // Mock a pending user
    mockRestoreSession.mockResolvedValue({
      token: 'pending-token',
      userProfile: {
        user: {
          id: '2',
          username: 'pendinguser',
          role: 'reader',
          status: 'pending'
        }
      }
    });

    const PendingTestComponent = () => {
      const { isPendingApproval, isAuthenticated, isLoadingAuth } = useAuth();

      if (isLoadingAuth) {
        return <Text>Loading...</Text>;
      }

      return (
        <>
          <Text testID="pending">
            {isPendingApproval ? 'Pending' : 'Not Pending'}
          </Text>
          <Text testID="authenticated">
            {isAuthenticated ? 'Auth' : 'Not Auth'}
          </Text>
        </>
      );
    };

    await act(async () => {
      render(
        <AuthProvider>
          <PendingTestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('pending').props.children).toBe('Pending');
      expect(screen.getByTestId('authenticated').props.children).toBe('Not Auth');
    });
  });

  it('Login success with authenticated status', async () => {
    // Start with no session
    mockRestoreSession.mockResolvedValue({ token: null, userProfile: null });

    // Mock successful login
    mockLogin.mockResolvedValue({
      success: true,
      token: 'mock-token',
      userProfile: {
        user: {
          id: '1',
          username: 'testuser',
          role: 'reader',
          status: 'active'
        }
      },
      message: 'Login successful'
    });

    const LoginTestComponent = () => {
      const { isAuthenticated, isLoadingAuth, login } = useAuth();

      if (isLoadingAuth) {
        return <Text>Loading...</Text>;
      }

      return (
        <>
          <Text testID="status">
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </Text>
          <Text
            testID="login-btn"
            onPress={() => login('test@example.com', 'password123')}
          >
            Login
          </Text>
        </>
      );
    };

    await act(async () => {
      render(
        <AuthProvider>
          <LoginTestComponent />
        </AuthProvider>
      );
    });

    // Verify initial state
    expect(screen.getByTestId('status').props.children).toBe('Not Authenticated');

    // Trigger login
    await act(async () => {
      screen.getByTestId('login-btn').props.onPress();
    });

    // Wait for login to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    // Now verify authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('status').props.children).toBe('Authenticated');
    });
  });
});
