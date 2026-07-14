// __tests__/context/AuthContext.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render, screen, waitFor, act } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import { AuthProvider, useAuth } from '@context/AuthContext';

// Create mock functions
const mockRestoreSession = jest.fn().mockResolvedValue(null);
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

// CORRECT: Mock must return { authService: { ... } }
// Because the source imports: import { authService } from '@services/authService'
jest.mock('@services/authService', () => ({
  authService: {
    restoreSession: mockRestoreSession,
    login: mockLogin,
    logout: mockLogout,
  }
}));

// Mock Keychain
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

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
  beforeEach(() => {
    jest.clearAllMocks();
    mockRestoreSession.mockReset();
    mockLogin.mockReset();
    mockLogout.mockReset();
    // Default: no persisted session
    mockRestoreSession.mockResolvedValue(null);
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
    mockRestoreSession.mockResolvedValue(null);
    mockedKeychain.getGenericPassword.mockResolvedValue(false);

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
    mockedKeychain.getGenericPassword.mockResolvedValue(false);

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
    mockRestoreSession.mockResolvedValue(null);
    mockedKeychain.getGenericPassword.mockResolvedValue(false);
    mockedKeychain.setGenericPassword.mockResolvedValue(true);

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
