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
test('Login success with authenticated status', async () => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/users/login/') && !url.includes('/refresh/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          access: 'auth-token',
          refresh: 'refresh-token',
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'reader',
            status: 'active'
          }
        })
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'reader',
          status: 'active'
        }
      })
    });
  }) as jest.Mock;

  (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

  const TestComponent = () => {
    const { login, isAuthenticated } = useAuth();
    return (
      <Text 
        testID="login-button"
        onPress={() => login('test@example.com', 'password123')}
      >
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </Text>
    );
  };

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('login-button')).toBeTruthy();
  });

  fireEvent.press(screen.getByTestId('login-button'));

  await waitFor(() => {
    expect(screen.getByText('Authenticated')).toBeTruthy();
  }, { timeout: 3000 });
});
test('Login failure with error message', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({
        detail: 'Invalid credentials'
      })
    })
  ) as jest.Mock;

  let loginResult: any = null;

  const TestComponent = () => {
    const { login } = useAuth();
    return (
      <Text 
        testID="login-fail-button"
        onPress={async () => {
          loginResult = await login('wrong@example.com', 'wrongpass');
        }}
      >
        Login
      </Text>
    );
  };

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('login-fail-button')).toBeTruthy();
  });

  fireEvent.press(screen.getByTestId('login-fail-button'));

  await waitFor(() => {
    expect(loginResult.success).toBe(false);
    expect(loginResult.message).toBe('Invalid credentials');
  }, { timeout: 3000 });
});
test('Logout clears state', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'reader',
          status: 'active'
        }
      })
    })
  ) as jest.Mock;

  (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);
  (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

  const TestComponent = () => {
    const { logout, isAuthenticated, authToken } = useAuth();
    return (
      <Text 
        testID="logout-button"
        onPress={() => logout()}
      >
        {isAuthenticated ? 'Authenticated' : 'Logged Out'} {authToken ? 'Has Token' : 'No Token'}
      </Text>
    );
  };

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('logout-button')).toBeTruthy();
  });

  fireEvent.press(screen.getByTestId('logout-button'));

  await waitFor(() => {
    expect(screen.getByText('Logged Out No Token')).toBeTruthy();
  }, { timeout: 3000 });
});
test('Staff role detection (admin/staff vs reader)', async () => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/users/login/') && !url.includes('/refresh/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          access: 'staff-token',
          refresh: 'refresh-token',
          user: {
            id: 1,
            email: 'staff@example.com',
            role: 'admin',
            status: 'active'
          }
        })
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 1,
          email: 'staff@example.com',
          role: 'admin',
          status: 'active'
        }
      })
    });
  }) as jest.Mock;

  (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

  const TestComponent = () => {
    const { login, isStaff } = useAuth();
    return (
      <Text 
        testID="staff-button"
        onPress={() => login('staff@example.com', 'password123')}
      >
        {isStaff ? 'Is Staff' : 'Not Staff'}
      </Text>
    );
  };

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('staff-button')).toBeTruthy();
  });

  fireEvent.press(screen.getByTestId('staff-button'));

  await waitFor(() => {
    expect(screen.getByText('Is Staff')).toBeTruthy();
  }, { timeout: 3000 });
});

test('Token refresh on session restore', async () => {
  const mockSession = {
    access: 'expired-token',
    refresh: 'refresh-token'
  };

  (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
    username: 'user_session',
    password: JSON.stringify(mockSession)
  });

  global.fetch = jest.fn((url) => {
    if (url.includes('/users/login/refresh/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          access: 'new-access-token',
          refresh: 'refresh-token'
        })
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'reader',
          status: 'active'
        }
      })
    });
  }) as jest.Mock;

  (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

  const TestComponent = () => {
    const { authToken } = useAuth();
    return <Text testID="token-status">{authToken ? 'Token Refreshed' : 'No Token'}</Text>;
  };

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Token Refreshed')).toBeTruthy();
  }, { timeout: 3000 });
});
