// __tests__/screens/Admin/CreateUser.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import CreateUserScreen from '@screens/Admin/CreateUser';
import { useUserStore } from '@store/useUserStore';
import { userService } from '@services/userService';
import { useAppTheme } from '@theme/useAppTheme';
import * as v from 'valibot';

// ==================== MOCKS ====================

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
    ActivityIndicator: 'ActivityIndicator',
    SafeAreaView: 'SafeAreaView',
    StyleSheet: { create: jest.fn(() => ({})) },
    Alert: { alert: jest.fn() },
    TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
    NativeModules: { DevMenu: null },
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  };
}, { virtual: true });

const mockFetchUsers = jest.fn().mockResolvedValue(undefined);

jest.mock('@store/useUserStore', () => ({
  useUserStore: jest.fn((selector) => {
    const state = { fetchUsers: mockFetchUsers };
    return selector ? selector(state) : state;
  }),
}));

jest.mock('@services/userService', () => ({
  userService: {
    createUser: jest.fn(),
  },
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('valibot', () => ({
  safeParse: jest.fn(),
  object: jest.fn(),
  string: jest.fn(),
  minLength: jest.fn(),
  email: jest.fn(),
  union: jest.fn(),
  literal: jest.fn(),
  optional: jest.fn(),
}));

jest.mock('@screens/Admin/CreateUser/schema', () => ({
  createUserSchema: {},
}));

jest.mock('@screens/Admin/CreateUser/styles', () => ({
  styles: {
    safeArea: {},
    container: {},
    title: {},
    errorBanner: {},
    errorBannerText: {},
    formCard: {},
    inputGroup: {},
    label: {},
    input: {},
    fieldErrorText: {},
    pickerContainer: {},
    pickerButton: {},
    pickerButtonText: {},
    submitButton: {},
    submitButtonText: {},
  },
}));

// ==================== TEST SETUP ====================

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
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
      placeholder: '#999999',
      inputBackground: '#F8F8F8',
      inputBorder: '#D0D0D0',
      primary: '#007AFF',
      danger: '#FF3B30',
      success: '#34C759',
      buttonPrimary: '#007AFF',
      buttonPrimaryText: '#FFFFFF',
      disabled: '#CCCCCC',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
    radius: { sm: 4, md: 8, lg: 12 },
  },
  isDark: false,
});

// ==================== HELPERS ====================

const findByTestID = (root: any, testID: string) => {
  const elements = root.findAll((el: any) => el.props.testID === testID);
  return elements.length > 0 ? elements[0] : null;
};

const changeText = (input: any, text: string) => {
  input.props.onChangeText(text);
};

// ==================== TESTS ====================

describe('CreateUserScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUsers.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    Alert.alert = jest.fn();
    (v.safeParse as jest.Mock).mockImplementation(() => ({
      success: true,
      issues: [],
    }));
    (useUserStore as jest.Mock).mockImplementation((selector) => {
      const state = { fetchUsers: mockFetchUsers };
      return selector ? selector(state) : state;
    });
    // Utiliser des timers factices pour contrôler les setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      expect(instance).toBeDefined();
    });

    it('devrait afficher le titre', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const title = findByTestID(root, 'create-user-title');
      expect(title).toBeDefined();
      expect(title.props.children).toBe('Nouveau Membre');
    });

    it('devrait afficher tous les champs', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      expect(findByTestID(root, 'create-user-firstname')).toBeDefined();
      expect(findByTestID(root, 'create-user-lastname')).toBeDefined();
      expect(findByTestID(root, 'create-user-email')).toBeDefined();
      expect(findByTestID(root, 'create-user-password')).toBeDefined();
      expect(findByTestID(root, 'create-user-role-reader')).toBeDefined();
      expect(findByTestID(root, 'create-user-role-staff')).toBeDefined();
      expect(findByTestID(root, 'create-user-role-admin')).toBeDefined();
    });

    it('devrait afficher le bouton de soumission', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const submitButton = findByTestID(root, 'create-user-submit');
      expect(submitButton).toBeDefined();
    });
  });

  // ===== VALIDATION =====
  describe('Validation', () => {
    it('devrait afficher des erreurs de validation quand les champs sont vides', async () => {
      (v.safeParse as jest.Mock).mockImplementationOnce(() => ({
        success: false,
        issues: [
          { path: [{ key: 'firstName' }], message: 'Le prénom est requis' },
          { path: [{ key: 'lastName' }], message: 'Le nom est requis' },
          { path: [{ key: 'email' }], message: 'L\'email est requis' },
          { path: [{ key: 'password' }], message: 'Le mot de passe est requis' },
        ],
      }));

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const submitButton = findByTestID(root, 'create-user-submit');

      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      expect(findByTestID(root, 'create-user-firstname-error')).toBeDefined();
      expect(findByTestID(root, 'create-user-lastname-error')).toBeDefined();
      expect(findByTestID(root, 'create-user-email-error')).toBeDefined();
      expect(findByTestID(root, 'create-user-password-error')).toBeDefined();
    });

    it('devrait afficher une erreur pour un email invalide', async () => {
      (v.safeParse as jest.Mock).mockImplementationOnce(() => ({
        success: false,
        issues: [
          { path: [{ key: 'email' }], message: 'Email invalide' },
        ],
      }));

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const submitButton = findByTestID(root, 'create-user-submit');

      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      const error = findByTestID(root, 'create-user-email-error');
      expect(error).toBeDefined();
      expect(error.props.children).toBe('Email invalide');
    });
  });

  // ===== SUBMISSION =====
  describe('Soumission', () => {
    it('devrait créer un utilisateur avec succès', async () => {
      (v.safeParse as jest.Mock).mockReturnValue({ success: true, issues: [] });
      (userService.createUser as jest.Mock).mockResolvedValueOnce({});

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const firstNameInput = findByTestID(root, 'create-user-firstname');
      const lastNameInput = findByTestID(root, 'create-user-lastname');
      const emailInput = findByTestID(root, 'create-user-email');
      const passwordInput = findByTestID(root, 'create-user-password');
      const roleButton = findByTestID(root, 'create-user-role-admin');

      await ReactTestRenderer.act(async () => {
        changeText(firstNameInput, 'John');
        changeText(lastNameInput, 'Doe');
        changeText(emailInput, 'john@example.com');
        changeText(passwordInput, 'password123');
        roleButton.props.onPress();
      });

      const submitButton = findByTestID(root, 'create-user-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      // Exécuter les promesses (fetchUsers, etc.)
      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });

      // Avancer les timers pour exécuter setTimeout
      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(400);
      });

      expect(userService.createUser).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin',
        status: 'active',
      });
      expect(mockFetchUsers).toHaveBeenCalledWith(true);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Succès',
        'Le nouveau membre a été créé avec succès.',
        expect.any(Array)
      );
    });

    it('devrait afficher une erreur API', async () => {
      (v.safeParse as jest.Mock).mockReturnValue({ success: true, issues: [] });
      (userService.createUser as jest.Mock).mockRejectedValueOnce(new Error('Email déjà utilisé'));

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const firstNameInput = findByTestID(root, 'create-user-firstname');
      const lastNameInput = findByTestID(root, 'create-user-lastname');
      const emailInput = findByTestID(root, 'create-user-email');
      const passwordInput = findByTestID(root, 'create-user-password');

      await ReactTestRenderer.act(async () => {
        changeText(firstNameInput, 'Jane');
        changeText(lastNameInput, 'Smith');
        changeText(emailInput, 'jane@example.com');
        changeText(passwordInput, 'password123');
      });

      const submitButton = findByTestID(root, 'create-user-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      // Exécuter les promesses
      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });

      // Avancer les timers pour exécuter setTimeout
      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(400);
      });

      const apiError = findByTestID(root, 'create-user-api-error');
      expect(apiError).toBeDefined();
      const errorText = apiError.props.children;
      expect(errorText.props.children).toBe('Email déjà utilisé');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Email déjà utilisé'
      );
    });

    it('devrait afficher un loader pendant la soumission', async () => {
      (v.safeParse as jest.Mock).mockReturnValue({ success: true, issues: [] });
      (userService.createUser as jest.Mock).mockImplementation(() => new Promise(() => {}));

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const firstNameInput = findByTestID(root, 'create-user-firstname');
      await ReactTestRenderer.act(async () => {
        changeText(firstNameInput, 'John');
      });

      const submitButton = findByTestID(root, 'create-user-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      const loader = findByTestID(root, 'create-user-loading');
      expect(loader).toBeDefined();
    });
  });

  // ===== NAVIGATION =====
  describe('Navigation', () => {
    it('devrait naviguer en arrière après succès', async () => {
      (v.safeParse as jest.Mock).mockReturnValue({ success: true, issues: [] });
      (userService.createUser as jest.Mock).mockResolvedValueOnce({});

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateUserScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const firstNameInput = findByTestID(root, 'create-user-firstname');
      const lastNameInput = findByTestID(root, 'create-user-lastname');
      const emailInput = findByTestID(root, 'create-user-email');
      const passwordInput = findByTestID(root, 'create-user-password');

      await ReactTestRenderer.act(async () => {
        changeText(firstNameInput, 'John');
        changeText(lastNameInput, 'Doe');
        changeText(emailInput, 'john@example.com');
        changeText(passwordInput, 'password123');
      });

      const submitButton = findByTestID(root, 'create-user-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      // Exécuter les promesses
      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });

      // Avancer les timers
      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(400);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Succès',
        'Le nouveau membre a été créé avec succès.',
        expect.arrayContaining([
          expect.objectContaining({
            text: 'OK',
            onPress: expect.any(Function),
          }),
        ])
      );

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const okButton = alertCall[2][0];
      expect(okButton.text).toBe('OK');

      await ReactTestRenderer.act(async () => {
        await okButton.onPress();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
