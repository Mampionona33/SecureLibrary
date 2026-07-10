import React from 'react';
import { render as rtlRender, fireEvent } from '@testing-library/react-native';
import MainStack from '@navigation/MainStack';
import { useVault } from '@context/VaultContext';

// On crée une référence pour espionner la fonction de clic
const mockToggleDrawer = jest.fn();

jest.mock('@navigation/DrawerNavigator', () => ({
  useCustomDrawer: () => ({
    toggleDrawer: mockToggleDrawer,
  }),
}));

jest.mock('@screens/Main/BookList', () => () => null);
jest.mock('@screens/Main/BookReader', () => () => null);

// Le mock génère un conteneur View avec un testID pour identifier l'écran actif
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ name, options }: any) => {
      const ReactLocal = require('react');
      const { View } = require('react-native');
      
      return ReactLocal.createElement(
        View,
        { testID: `screen-${name}` },
        options?.headerLeft ? options.headerLeft() : null
      );
    },
  }),
}));

jest.mock('@context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
  AuthProvider: ({ children }: any) => children,
}));

// On passe le mock en jest.fn() pour pouvoir modifier sa valeur selon le test
jest.mock('@context/VaultContext', () => ({
  useVault: jest.fn(() => ({
    isVaultConfigured: false,
  })),
  VaultProvider: ({ children }: any) => children,
}));

describe('MainStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('MainStack renders without crashing', async () => {
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

  test('MainStack defines both BookList and BookReader screens', async () => {
    const { queryByTestId } = await rtlRender(<MainStack />);

    // Both screens should always be defined in the navigator
    expect(queryByTestId('screen-BookList')).toBeTruthy();
    expect(queryByTestId('screen-BookReader')).toBeTruthy();
  });
});
