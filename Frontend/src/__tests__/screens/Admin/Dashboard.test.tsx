import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import AdminDashboardScreen from '@screens/Admin/Dashboard';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS ====================

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  SafeAreaView: 'SafeAreaView',
  StyleSheet: { create: jest.fn(() => ({})) },
  TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
  NativeModules: { DevMenu: null },
}), { virtual: true });

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@screens/Admin/Dashboard/styles', () => ({
  styles: {
    safeArea: {},
    container: {},
    title: {},
    subtitle: {},
    grid: {},
    card: {},
    cardIcon: {},
    cardTitle: {},
    cardDescription: {},
  },
}));

// ==================== TEST SETUP ====================

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
};

(useAppTheme as jest.Mock).mockReturnValue({
  theme: {
    colors: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      border: '#E0E0E0',
      text: '#000000',
      textSecondary: '#666666',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    },
  },
  isDark: false,
});

// ==================== TESTS ====================

describe('AdminDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <AdminDashboardScreen navigation={mockNavigation} />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le titre et le sous-titre', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <AdminDashboardScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const title = root.find((el: any) => el.props.testID === 'admin-dashboard-title');
      const subtitle = root.find((el: any) => el.props.testID === 'admin-dashboard-subtitle');
      expect(title).toBeDefined();
      expect(subtitle).toBeDefined();
      expect(title.props.children).toBe('Console Administration');
      expect(subtitle.props.children).toBe('Gestion de la bibliothèque sécurisée');
    });

    it('devrait afficher les trois cartes', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <AdminDashboardScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const cardUsers = root.find((el: any) => el.props.testID === 'admin-card-manage-users');
      const cardBooks = root.find((el: any) => el.props.testID === 'admin-card-manage-books');
      const cardCategories = root.find((el: any) => el.props.testID === 'admin-card-manage-categories');
      expect(cardUsers).toBeDefined();
      expect(cardBooks).toBeDefined();
      expect(cardCategories).toBeDefined();
    });

    it('devrait afficher les titres des cartes', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <AdminDashboardScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const titleUsers = root.find((el: any) => el.props.testID === 'admin-card-manage-users-title');
      const titleBooks = root.find((el: any) => el.props.testID === 'admin-card-manage-books-title');
      const titleCategories = root.find((el: any) => el.props.testID === 'admin-card-manage-categories-title');
      expect(titleUsers.props.children).toBe('Validation Membres');
      expect(titleBooks.props.children).toBe('Gestion Livres');
      expect(titleCategories.props.children).toBe('Catégories');
    });
  });

  // ===== INTERACTION TESTS =====
  describe('Interactions', () => {
    it('devrait naviguer vers ManageUsers lors du clic sur la carte Utilisateurs', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <AdminDashboardScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const card = root.find((el: any) => el.props.testID === 'admin-card-manage-users');
      await ReactTestRenderer.act(async () => {
        card.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('ManageUsers');
    });

    it('devrait naviguer vers ManageBooks lors du clic sur la carte Livres', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <AdminDashboardScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const card = root.find((el: any) => el.props.testID === 'admin-card-manage-books');
      await ReactTestRenderer.act(async () => {
        card.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('ManageBooks');
    });

    it('devrait naviguer vers ManageCategories lors du clic sur la carte Catégories', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <AdminDashboardScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const card = root.find((el: any) => el.props.testID === 'admin-card-manage-categories');
      await ReactTestRenderer.act(async () => {
        card.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('ManageCategories');
    });
  });
});
