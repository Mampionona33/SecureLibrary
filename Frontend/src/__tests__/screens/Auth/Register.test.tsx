// __tests__/screens/Auth/Register.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import RegisterScreen from '@screens/Auth/Register';
import { useAuth } from '@context/AuthContext';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS ====================

jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  ScrollView: 'ScrollView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
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

jest.mock('@screens/Auth/Register/styles', () => ({
  useStyles: jest.fn(() => ({
    safeArea: { flex: 1 },
    container: { padding: 16 },
    headerContainer: { alignItems: 'center' },
    logoIcon: { fontSize: 40 },
    title: { fontSize: 24, fontWeight: 'bold' },
    titleHighlight: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
    subtitle: { fontSize: 14, color: '#666' },
    formContainer: { marginTop: 20 },
    label: { fontSize: 14, fontWeight: '600' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
    input: { flex: 1, padding: 8 },
    inputErrorBorder: { borderColor: 'red' },
    errorText: { color: 'red', fontSize: 12 },
    submitButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
    submitButtonDisabled: { opacity: 0.5 },
    submitButtonText: { color: '#fff', textAlign: 'center' },
    toggleButton: { padding: 8 },
    toggleText: { color: '#007AFF' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { color: '#666' },
    footerLink: { color: '#007AFF', fontWeight: 'bold' },
  })),
}));

jest.mock('@screens/Auth/Register/schema', () => ({
  registerSchema: {},
  RegisterFormType: {},
}));

// ========== MOCK REACT-HOOK-FORM ==========
let mockFormState = {
  lastName: '',
  firstName: '',
  email: '',
  password: '',
  confirmPassword: '',
};
let mockErrors = {};
let onSubmitCallback: any = null;

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => {
    const handleSubmit = (callback: any) => {
      onSubmitCallback = callback;
      return () => callback(mockFormState);
    };
    return {
      control: {
        register: jest.fn(),
        unregister: jest.fn(),
      },
      handleSubmit,
      formState: { errors: mockErrors },
      setValue: (name: string, value: string) => {
        mockFormState = { ...mockFormState, [name]: value };
      },
      getValues: () => mockFormState,
    };
  }),
  Controller: ({ render, name }: any) => {
    const field = {
      value: mockFormState[name as keyof typeof mockFormState] || '',
      onChange: (value: string) => {
        mockFormState = { ...mockFormState, [name]: value };
      },
      onBlur: jest.fn(),
    };
    return render({ field, formState: { errors: mockErrors } });
  },
}));

// ========== HELPERS ==========
const resetFormState = () => {
  mockFormState = {
    lastName: '',
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  mockErrors = {};
  onSubmitCallback = null;
};

const submitForm = async () => {
  if (onSubmitCallback) {
    await onSubmitCallback(mockFormState);
  }
};

// ========== TEST SETUP ==========
const mockTheme = {
  theme: {
    colors: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      border: '#E0E0E0',
      text: '#000000',
      textSecondary: '#666666',
      textMuted: '#999999',
      placeholder: '#999999',
      primary: '#007AFF',
      danger: '#FF3B30',
      success: '#34C759',
      inputBackground: '#F8F8F8',
      inputBorder: '#D0D0D0',
      buttonPrimary: '#007AFF',
      buttonPrimaryText: '#FFFFFF',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 999 },
  },
  isDark: false,
};

const mockNavigation = { navigate: jest.fn() };
const mockRoute = { key: 'register', name: 'Register', params: {} };

// ========== TESTS ==========
describe('RegisterScreen', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    resetFormState();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
    (useAuth as jest.Mock).mockReturnValue({ register: jest.fn() });
    // Mock fetch
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    } as any);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  // ===== RENDU =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher les champs du formulaire', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const inputs = instance.root.findAllByType('TextInput');
      expect(inputs.length).toBe(5);
    });

    it('devrait afficher le bouton d\'inscription', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const texts = instance.root.findAllByType('Text');
      const hasButton = texts.some((el: any) => {
        const children = el.props.children;
        if (Array.isArray(children)) {
          return children.some((c: any) => typeof c === 'string' && c.includes("S'inscrire"));
        }
        return typeof children === 'string' && children.includes("S'inscrire");
      });
      expect(hasButton).toBe(true);
    });

    it('devrait afficher le lien vers Login', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const loginLink = instance.root.find(
        (el: any) => el.props.testID === 'register-login-link'
      );
      expect(loginLink).toBeDefined();
    });
  });

  // ===== INTERACTIONS AVEC testID =====
  describe('Interactions utilisateur', () => {
    it('devrait permettre de saisir le nom', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const input = instance.root.find(
        (el: any) => el.props.testID === 'register-lastname'
      );
      expect(input).toBeDefined();

      await ReactTestRenderer.act(async () => {
        input.props.onChangeText('Doe');
      });
      expect(mockFormState.lastName).toBe('Doe');
    });

    it('devrait permettre de saisir le prénom', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const input = instance.root.find(
        (el: any) => el.props.testID === 'register-firstname'
      );
      expect(input).toBeDefined();

      await ReactTestRenderer.act(async () => {
        input.props.onChangeText('John');
      });
      expect(mockFormState.firstName).toBe('John');
    });

    it('devrait permettre de saisir l\'email', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const input = instance.root.find(
        (el: any) => el.props.testID === 'register-email'
      );
      expect(input).toBeDefined();

      await ReactTestRenderer.act(async () => {
        input.props.onChangeText('test@example.com');
      });
      expect(mockFormState.email).toBe('test@example.com');
    });

    it('devrait permettre de saisir le mot de passe', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const input = instance.root.find(
        (el: any) => el.props.testID === 'register-password'
      );
      expect(input).toBeDefined();

      await ReactTestRenderer.act(async () => {
        input.props.onChangeText('password123');
      });
      expect(mockFormState.password).toBe('password123');
    });

    it('devrait permettre de saisir la confirmation', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const input = instance.root.find(
        (el: any) => el.props.testID === 'register-confirm-password'
      );
      expect(input).toBeDefined();

      await ReactTestRenderer.act(async () => {
        input.props.onChangeText('password123');
      });
      expect(mockFormState.confirmPassword).toBe('password123');
    });

    it('devrait basculer l\'affichage du mot de passe', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const toggleButton = instance.root.find(
        (el: any) => el.props.testID === 'register-toggle-password'
      );
      expect(toggleButton).toBeDefined();

      const passwordInput = instance.root.find(
        (el: any) => el.props.testID === 'register-password'
      );
      expect(passwordInput.props.secureTextEntry).toBe(true);

      await ReactTestRenderer.act(async () => {
        toggleButton.props.onPress();
      });

      const updatedPasswordInput = instance.root.find(
        (el: any) => el.props.testID === 'register-password'
      );
      expect(updatedPasswordInput.props.secureTextEntry).toBe(false);
    });
  });

  // ===== SOUMISSION =====
  describe('Soumission', () => {
    it('devrait appeler l\'API avec les bons paramètres en cas de succès', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as any);

      mockFormState = {
        lastName: 'Doe',
        firstName: 'John',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/users/register/',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
          }),
        })
      );

      const Alert = require('react-native').Alert;
      expect(Alert.alert).toHaveBeenCalledWith(
        'Succès',
        expect.stringContaining('compte a été créé'),
        expect.anything()
      );
    });

    it('devrait gérer une erreur de validation (email déjà utilisé)', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ email: ['user with this email already exists.'] }),
      } as any);

      mockFormState = {
        lastName: 'Doe',
        firstName: 'John',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await ReactTestRenderer.act(async () => {
        ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const Alert = require('react-native').Alert;
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'user with this email already exists.'
      );
    });

    // Dans le bloc Soumission
    it('devrait gérer une erreur réseau', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'));

      mockFormState = {
      lastName: 'Doe',
      firstName: 'John',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <RegisterScreen navigation={mockNavigation} route={mockRoute} />
      );
    });

     await ReactTestRenderer.act(async () => {
      await submitForm();
     });

     await new Promise((resolve) => setTimeout(resolve, 100));

      const Alert = require('react-native').Alert;
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Network error' // ✅ Correction ici
      );
    });

    it('devrait naviguer vers Login après succès', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as any);

      mockFormState = {
        lastName: 'Doe',
        firstName: 'John',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await ReactTestRenderer.act(async () => {
        ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const Alert = require('react-native').Alert;
      expect(Alert.alert).toHaveBeenCalledWith(
        'Succès',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({
            text: 'OK',
            onPress: expect.any(Function),
          }),
        ])
      );

      // Simuler le clic sur OK
      const alertCall = Alert.alert.mock.calls[0];
      const okButton = alertCall[2][0];
      okButton.onPress();

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  // ===== NAVIGATION =====
  describe('Navigation', () => {
    it('devrait naviguer vers Login quand on clique sur "Se connecter"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <RegisterScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const loginLink = instance.root.find(
        (el: any) => el.props.testID === 'register-login-link'
      );
      expect(loginLink).toBeDefined();

      await ReactTestRenderer.act(async () => {
        loginLink.props.onPress();
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });
});
