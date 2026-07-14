import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import AppNavigator from '@navigation/AppNavigator';
import { useAuth } from '@context/AuthContext';
import { useVault } from '@context/VaultContext';

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ component: Component }: any) => Component ? Component({}) : null,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  DefaultTheme: {
    colors: {
      primary: '#000',
      background: '#fff',
      card: '#fff',
      text: '#000',
      border: '#ccc',
      notification: '#ff0000',
    },
  },
  DarkTheme: {
    colors: {
      primary: '#fff',
      background: '#000',
      card: '#111',
      text: '#fff',
      border: '#333',
      notification: '#ff0000',
    },
  },
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: () => ({
    isDark: false,
  }),
}));

jest.mock('@navigation/SecurityStack', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'mock-security-stack' });
});

jest.mock('@navigation/AuthStack', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'mock-auth-stack' });
});

jest.mock('@navigation/DrawerNavigator', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'mock-drawer' });
});

jest.mock('@screens/Auth/PendingApproval', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'mock-pending' });
});

jest.mock('@context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@context/VaultContext', () => ({
  useVault: jest.fn(),
}));

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders SecurityStack when vault is not configured', async () => {
    (useVault as jest.Mock).mockReturnValue({
      isVaultConfigured: false,
      isVaultUnlocked: false,
      isLoadingVault: false,
    });

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isPendingApproval: false,
      isLoadingAuth: false,
    });

    expect(() => {
      rtlRender(<AppNavigator />);
    }).not.toThrow();
  });

  test('renders AuthStack when vault is unlocked but user not authenticated', async () => {
    (useVault as jest.Mock).mockReturnValue({
      isVaultConfigured: true,
      isVaultUnlocked: true,
      isLoadingVault: false,
    });

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isPendingApproval: false,
      isLoadingAuth: false,
    });

    expect(() => {
      rtlRender(<AppNavigator />);
    }).not.toThrow();
  });

  test('renders DrawerNavigator when vault unlocked and user authenticated', async () => {
    (useVault as jest.Mock).mockReturnValue({
      isVaultConfigured: true,
      isVaultUnlocked: true,
      isLoadingVault: false,
    });

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isPendingApproval: false,
      isLoadingAuth: false,
    });

    expect(() => {
      rtlRender(<AppNavigator />);
    }).not.toThrow();
  });
});
