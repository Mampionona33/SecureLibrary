// __tests__/screens/Auth/PendingApproval.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import PendingApprovalScreen from '@screens/Auth/PendingApproval';
import { useAuth } from '@context/AuthContext';
import { useAppTheme } from '@theme/useAppTheme';
import axios from 'axios';

// ==================== MOCKS ====================

jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  SafeAreaView: 'SafeAreaView',
  StyleSheet: { create: jest.fn(() => ({})) },
  Alert: { alert: jest.fn() },
  Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
  NativeModules: { DevMenu: null, DevSettings: { addMenuItem: jest.fn(), reload: jest.fn() } },
}), { virtual: true });

jest.mock('@context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('axios');

jest.mock('@screens/Auth/PendingApproval/styles', () => ({
  styles: {
    safeArea: { flex: 1 },
    container: { padding: 16 },
    card: { padding: 16, borderRadius: 8, backgroundColor: '#fff' },
    icon: { fontSize: 40 },
    title: { fontSize: 20, fontWeight: 'bold' },
    subtitle: { fontSize: 14, color: '#666' },
    statusBadge: { marginTop: 16, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 },
    lastChecked: { fontSize: 12, color: '#333' },
    buttonContainer: { marginTop: 20 },
    refreshButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
    disabledButton: { opacity: 0.5 },
    refreshButtonText: { color: '#fff', textAlign: 'center' },
    logoutButton: { marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: '#e0e0e0' },
    logoutButtonText: { color: '#333', textAlign: 'center' },
  },
}));

// ========== MOCK DE useAuth ==========
const mockUseAuth = {
  user: null,
  setUser: jest.fn(),
  logout: jest.fn(),
  authToken: 'mock-token',
};

(useAuth as jest.Mock).mockReturnValue(mockUseAuth);

// ========== TEST SETUP ==========
const mockTheme = {
  theme: {
    colors: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      text: '#000000',
      primary: '#007AFF',
      placeholder: '#999999',
      buttonPrimaryText: '#FFFFFF',
    },
    spacing: { sm: 8, md: 12, lg: 16 },
    radius: { md: 8 },
  },
  isDark: false,
};

(useAppTheme as jest.Mock).mockReturnValue(mockTheme);

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PendingApprovalScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockReset();
    mockUseAuth.logout.mockReset();
    mockUseAuth.setUser.mockReset();
    mockUseAuth.user = null;
    Alert.alert = jest.fn();
  });

  // ===== RENDU =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le titre, le sous-titre et l\'icône', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;

      const title = root.find((el: any) => el.props.testID === 'pending-title');
      const subtitle = root.find((el: any) => el.props.testID === 'pending-subtitle');
      const icon = root.findAllByType(Text).find((el: any) => el.props.children === '⏳');

      expect(title).toBeDefined();
      expect(subtitle).toBeDefined();
      expect(icon).toBeDefined();
    });

    it('devrait afficher les boutons "Vérifier" et "Retour au Login"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;

      const refreshButton = root.find((el: any) => el.props.testID === 'pending-refresh-button');
      const logoutButton = root.find((el: any) => el.props.testID === 'pending-logout-button');

      expect(refreshButton).toBeDefined();
      expect(logoutButton).toBeDefined();
    });

    it('ne devrait pas afficher le badge de statut initialement', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;

      const badge = root.findAll((el: any) => el.props.testID === 'pending-status-badge');
      expect(badge.length).toBe(0);
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions', () => {
    it('devrait appeler logout quand on clique sur "Retour au Login"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;
      const logoutButton = root.find((el: any) => el.props.testID === 'pending-logout-button');

      await ReactTestRenderer.act(async () => {
        logoutButton.props.onPress();
      });

      expect(mockUseAuth.logout).toHaveBeenCalled();
    });

    it('devrait afficher l\'indicateur de chargement pendant la vérification', async () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // never resolves

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;
      const refreshButton = root.find((el: any) => el.props.testID === 'pending-refresh-button');

      await ReactTestRenderer.act(async () => {
        refreshButton.props.onPress();
      });

      // Vérifier que l'ActivityIndicator est présent
      const indicator = root.find((el: any) => el.props.testID === 'pending-activity-indicator');
      expect(indicator).toBeDefined();
    });

    it('devrait désactiver les boutons pendant le chargement', async () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;
      const refreshButton = root.find((el: any) => el.props.testID === 'pending-refresh-button');

      await ReactTestRenderer.act(async () => {
        refreshButton.props.onPress();
      });

      // Vérifier que le bouton est désactivé
      expect(refreshButton.props.disabled).toBe(true);
      const logoutButton = root.find((el: any) => el.props.testID === 'pending-logout-button');
      expect(logoutButton.props.disabled).toBe(true);
    });
  });

  // ===== APPEL API =====
  describe('Vérification du statut', () => {
    it('devrait appeler l\'API avec le bon token', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { user: { status: 'pending' } },
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;
      const refreshButton = root.find((el: any) => el.props.testID === 'pending-refresh-button');

      await ReactTestRenderer.act(async () => {
        refreshButton.props.onPress();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/users/me/',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('devrait mettre à jour le badge "dernière vérification" après succès', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { user: { status: 'pending' } },
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;
      const refreshButton = root.find((el: any) => el.props.testID === 'pending-refresh-button');

      await ReactTestRenderer.act(async () => {
        refreshButton.props.onPress();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const badge = root.find((el: any) => el.props.testID === 'pending-status-badge');
      expect(badge).toBeDefined();
      const lastChecked = root.find((el: any) => el.props.testID === 'pending-last-checked');
      expect(lastChecked).toBeDefined();
    });

    it('devrait afficher une alerte si le statut devient "active"', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { user: { status: 'active' } },
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;
      const refreshButton = root.find((el: any) => el.props.testID === 'pending-refresh-button');

      await ReactTestRenderer.act(async () => {
        refreshButton.props.onPress();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Félicitations !',
        'Votre compte a été approuvé.'
      );
    });

    it('devrait mettre à jour l\'utilisateur avec setUser', async () => {
      const userData = { id: 1, status: 'active' };
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { user: userData },
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;
      const refreshButton = root.find((el: any) => el.props.testID === 'pending-refresh-button');

      await ReactTestRenderer.act(async () => {
        refreshButton.props.onPress();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockUseAuth.setUser).toHaveBeenCalledWith(userData);
    });

    it('devrait gérer une erreur de l\'API (Alert)', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<PendingApprovalScreen />);
      });
      const root = instance.root;
      const refreshButton = root.find((el: any) => el.props.testID === 'pending-refresh-button');

      await ReactTestRenderer.act(async () => {
        refreshButton.props.onPress();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de joindre le serveur de sécurité.'
      );
    });
  });
});
