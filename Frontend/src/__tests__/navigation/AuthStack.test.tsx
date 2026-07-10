import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import AuthStack from '@navigation/AuthStack';

// 1. Le mock global de native-stack porte lui-même le testID 🌟
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: any) => children,
    Screen: ({ name, component: Component }: any) => {
      const ReactLocal = require('react');
      const { View } = require('react-native');
      
      // On attache le testID directement sur une View globale qui enveloppe l'écran
      return ReactLocal.createElement(
        View, 
        { testID: `screen-${name}` }, 
        Component ? ReactLocal.createElement(Component) : null
      );
    },
  })),
}));

// Mocks simples des écrans
jest.mock('@screens/Auth/Login', () => () => null);
jest.mock('@screens/Auth/Register', () => () => null);
jest.mock('@screens/Auth/PendingApproval', () => () => null);

describe('AuthStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the expected screens', async () => {
    const screens = ['Login', 'Register', 'PendingApproval'];

    const { queryByTestId } = await rtlRender(<AuthStack />);

    screens.forEach((screenName) => {
      expect(queryByTestId(`screen-${screenName}`)).toBeTruthy();
    });
  });
});
