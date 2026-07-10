import React from 'react';
import { render as rtlRender, fireEvent } from '@testing-library/react-native';
import MainStack from '@navigation/MainStack';

// On crée une référence pour espionner la fonction de clic
const mockToggleDrawer = jest.fn();

jest.mock('@navigation/DrawerNavigator', () => ({
  useCustomDrawer: () => ({
    toggleDrawer: mockToggleDrawer,
  }),
}));

jest.mock('@screens/Main/BookList', () => () => null);
jest.mock('@screens/Main/BookReader', () => () => null);

// Le mock exécute headerLeft() pour rendre le bouton ☰ accessible au test
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ options }: any) => {
      return options?.headerLeft ? options.headerLeft() : null;
    },
  }),
}));

jest.mock('@context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock('@context/VaultContext', () => ({
  useVault: () => ({ isVaultConfigured: false }),
  VaultProvider: ({ children }: any) => children,
}));

describe('MainStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('MainStack renders without crashing', () => {
    expect(() => {
      rtlRender(<MainStack />);
    }).not.toThrow();
  });

  test('MainStack déclenche toggleDrawer quand on clique sur le bouton de menu', async () => {
    const { getByText } = await rtlRender(<MainStack />);
    const menuButton = getByText('☰');
    fireEvent.press(menuButton);
    expect(mockToggleDrawer).toHaveBeenCalled();
  });
});
