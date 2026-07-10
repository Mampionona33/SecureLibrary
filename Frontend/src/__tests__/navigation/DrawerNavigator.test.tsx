import React from 'react';
import { render as rtlRender, fireEvent } from '@testing-library/react-native';
import DrawerNavigator from '@navigation/DrawerNavigator';
import { useAuth } from '@context/AuthContext';

// 1. Mocks des piles de navigation internes (les sous-composants)
jest.mock('@navigation/MainStack', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');
  return () => ReactLocal.createElement(View, { testID: 'mock-main-stack' });
});

jest.mock('@navigation/AdminStack', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');
  return () => ReactLocal.createElement(View, { testID: 'mock-admin-stack' });
});

// 2. Mock du AuthContext ajustable
jest.mock('@context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isStaff: false,
    logout: jest.fn(),
  })),
}));

// 3. Mock des Hooks de Thème et Store (Zustand)
jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: () => ({
    isDark: false,
    theme: {
      colors: { overlay: '#000', surface: '#fff', border: '#ccc', surfaceVariant: '#eee', text: '#000', textSecondary: '#666', inputBackground: '#fff', primary: '#00f', danger: '#f00' },
      spacing: { sm: 4, md: 8, lg: 16, xl: 24 },
      radius: { md: 8 },
    },
  }),
}));

jest.mock('@store/useThemeStore', () => ({
  useThemeStore: jest.fn(() => jest.fn()),
}));

describe('DrawerNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('DrawerNavigator charge MainStack par défaut pour un utilisateur non-staff', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isStaff: false,
      logout: jest.fn(),
    });

    const { queryByTestId } = await rtlRender(<DrawerNavigator />);

    // Le MainStack doit être visible, et l'AdminStack absent
    expect(queryByTestId('mock-main-stack')).toBeTruthy();
    expect(queryByTestId('mock-admin-stack')).toBeNull();
  });

  test('DrawerNavigator affiche le bouton Panel Console Admin si l’utilisateur est Staff', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isStaff: true,
      logout: jest.fn(),
    });

    const { getByText } = await rtlRender(<DrawerNavigator />);

    // On vérifie que le texte du bouton admin s'affiche bien
    expect(getByText('⚙️ Panel Console Admin')).toBeTruthy();
  });
});
