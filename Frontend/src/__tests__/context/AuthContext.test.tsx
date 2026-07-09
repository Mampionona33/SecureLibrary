import React from 'react';
import { render, screen, waitFor , fireEvent} from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '@context/AuthContext';
import * as Keychain from 'react-native-keychain';

jest.mock('react-native-keychain');

const TestAuthConsumer = () => {
  const { isAuthenticated } = useAuth();
  return <Text>{isAuthenticated ? 'Authenticated' : 'Test Content'}</Text>;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(null);
  });

  test('AuthProvider loads without crashing', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeTruthy();
    });
  });

  test('AuthProvider initializes with isAuthenticated as false', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeDefined();
    });
  });
});
test('AuthProvider handles pending approval status correctly', async () => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/users/login/') && !url.includes('/refresh/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          access: 'pending-token',
          refresh: 'pending-refresh',
          user: {
            id: 1,
            email: 'pending@example.com',
            role: 'reader',
            status: 'pending'
          }
        })
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 1,
          email: 'pending@example.com',
          role: 'reader',
          status: 'pending'
        }
      })
    });
  }) as jest.Mock;

  (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

  const TestComponent = () => {
    const { login, isPendingApproval } = useAuth();
    
    return (
      <Text 
        testID="pending-text"
        onPress={() => login('pending@example.com', 'password123')}
      >
        {isPendingApproval ? 'Pending Approval' : 'Not Pending'}
      </Text>
    );
  };

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('pending-text')).toBeTruthy();
  });

  const textElement = screen.getByTestId('pending-text');
  fireEvent.press(textElement);

  await waitFor(() => {
    expect(screen.getByText('Pending Approval')).toBeTruthy();
  }, { timeout: 3000 });
});
