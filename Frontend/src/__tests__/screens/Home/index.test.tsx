// __tests__/screens/Home/index.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, View, Button } from 'react-native';
// ✅ Utilisation de l'alias avec l'index explicite
import HomeScreen from '@screens/Home/index';
import { useAuth } from '@context/AuthContext';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS ====================

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Button: 'Button',
  StyleSheet: { create: jest.fn(() => ({})) },
  TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
  NativeModules: { DevMenu: null },
}), { virtual: true });

jest.mock('@context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@screens/Home/styles', () => ({
  styles: {
    container: {},
    title: {},
    subtitle: {},
  },
}));

jest.mock('@navigation/types', () => ({
  RootStackParamList: {},
}));

// ========== TEST SETUP ==========
const mockLogout = jest.fn();

(useAuth as jest.Mock).mockReturnValue({
  logout: mockLogout,
});

(useAppTheme as jest.Mock).mockReturnValue({
  theme: {
    colors: {
      text: '#000000',
      background: '#FFFFFF',
    },
    spacing: { md: 16 },
  },
  isDark: false,
});

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  key: 'home',
  name: 'Home',
  params: {},
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogout.mockReset();
  });

  // ===== RENDU =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le titre "Page d\'Accueil"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const root = instance.root;
      const texts = root.findAllByType('Text');
      const titleText = texts.find((el: any) => el.props.children === 'Page d\'Accueil');
      expect(titleText).toBeDefined();
    });

    it('devrait afficher le sous-titre "Bienvenue !"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const root = instance.root;
      const texts = root.findAllByType('Text');
      const subtitleText = texts.find((el: any) => el.props.children === 'Bienvenue !');
      expect(subtitleText).toBeDefined();
    });

    it('devrait afficher le bouton "Se déconnecter"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const root = instance.root;
      const buttons = root.findAllByType('Button');
      const logoutButton = buttons.find((el: any) => el.props.title === 'Se déconnecter');
      expect(logoutButton).toBeDefined();
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions', () => {
    it('devrait appeler logout lors du clic sur le bouton de déconnexion', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <HomeScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const root = instance.root;
      const buttons = root.findAllByType('Button');
      const logoutButton = buttons.find((el: any) => el.props.title === 'Se déconnecter');

      expect(logoutButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        logoutButton.props.onPress();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
