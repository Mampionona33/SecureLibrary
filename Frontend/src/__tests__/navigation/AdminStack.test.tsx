import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import AdminStack from '@navigation/AdminStack';

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ children }: any) => children || null,
  })),
}));

// 2. Mock du tiroir de navigation
jest.mock('@navigation/DrawerNavigator', () => ({
  useCustomDrawer: jest.fn(() => ({
    toggleDrawer: jest.fn(),
  })),
}));

// 3. Mocks des écrans pour empêcher l'importation de fichiers physiques instables
jest.mock('@screens/Admin/Dashboard', () => () => null);
jest.mock('@screens/Admin/ManageUsers', () => () => null);

describe('AdminStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('AdminStack renders without crashing', async () => {
    await expect((async () => {
      await rtlRender(<AdminStack />);
    })()).resolves.not.toThrow();
  });
});
