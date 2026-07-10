import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import MainStack from '@navigation/MainStack';

jest.mock('@navigation/DrawerNavigator', () => ({
  useCustomDrawer: () => ({
    toggleDrawer: jest.fn(),
  }),
}));

jest.mock('@screens/Main/BookList', () => () => null);
jest.mock('@screens/Main/BookReader', () => () => null);

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ name, component }: any) => null,
  }),
}));

jest.mock('@context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isStaff: false,
    isPendingApproval: false,
    isLoadingAuth: false,
    authToken: 'mock-token',
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock('@context/VaultContext', () => ({
  useVault: () => ({
    isVaultConfigured: false,
    isVaultUnlocked: false,
    isLoadingVault: false,
    setupLocalVault: jest.fn(),
    unlockVault: jest.fn(),
    lockVault: jest.fn(),
    resetVault: jest.fn(),
  }),
  VaultProvider: ({ children }: any) => children,
}));

describe('MainStack', () => {
  test('MainStack renders without crashing', () => {
    expect(() => {
      rtlRender(<MainStack />);
    }).not.toThrow();
  });
});
