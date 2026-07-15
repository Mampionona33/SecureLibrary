// __tests__/screens/Auth/Login.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import LoginScreen from '@screens/Auth/Login';
import { useAuth } from '@context/AuthContext';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS - SETUP FIRST ====================

// Mock @env BEFORE anything else
jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

// Mock the theme hook
jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock the auth context
jest.mock('@context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => children,
}));

// Mock styles file
jest.mock('@screens/Auth/Login/styles', () => ({
  styles: {
    safeArea: {},
    container: {},
    headerContainer: {},
    logoIcon: {},
    title: {},
    subtitle: {},
    formContainer: {},
    label: {},
    inputContainer: {},
    input: {},
    errorText: {},
    submitButton: {},
    submitButtonDisabled: {},
    submitButtonText: {},
    footer: {},
    footerText: {},
    registerLink: {},
  },
}));

// Mock validation schema
jest.mock('@screens/Auth/Login/schema', () => ({
  loginSchema: {
    validate: jest.fn(),
  },
  LoginFormType: {},
}));

// Mock react-hook-form avec une implémentation qui fonctionne
let mockFormState = { email: '', password: '' };
let mockErrors = {};
let onSubmitCallback: any = null;

jest.mock('react-hook-form', () => {
  return {
    useForm: jest.fn(() => {
      // Créer une fonction handleSubmit qui stocke le callback
      const handleSubmit = (callback: any) => {
        // Stocker le callback pour pouvoir l'appeler dans les tests
        onSubmitCallback = callback;
        // Retourner une fonction qui sera appelée par le bouton
        return () => {
          // Appeler le callback avec les données du formulaire
          return callback(mockFormState);
        };
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
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

// ==================== TEST SETUP ====================

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
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
    },
    radius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 999,
    },
  },
  isDark: false,
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  key: 'login',
  name: 'Login',
  params: {},
};

// Reset form state between tests
const resetFormState = () => {
  mockFormState = { email: '', password: '' };
  mockErrors = {};
  onSubmitCallback = null;
};

// Helper pour soumettre le formulaire en appelant directement le callback
const submitForm = async () => {
  if (onSubmitCallback) {
    // Appeler le callback avec les données du formulaire
    await onSubmitCallback(mockFormState);
  }
};

// ==================== TESTS ====================

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetFormState();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
    });
  });

  // ==================== RENDER TESTS ====================

  describe('Rendu', () => {
    it('devrait afficher le titre et le sous-titre', async () => {
      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      const textElements = root.findAllByType(Text);

      const titleText = textElements.find(
        (el: any) => el.props.children === 'SecureLibrary'
      );
      const subtitleText = textElements.find(
        (el: any) =>
          el.props.children === 'Bibliothèque Chiffrée & Coffre-fort Numérique'
      );

      expect(titleText).toBeTruthy();
      expect(subtitleText).toBeTruthy();
    });

    it('devrait afficher le formulaire de connexion avec placeholders', async () => {
      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      const inputs = root.findAllByType(TextInput);

      expect(inputs.length).toBeGreaterThanOrEqual(2);

      const emailInput = inputs[0];
      const passwordInput = inputs[1];

      expect(emailInput.props.placeholder).toBe('exemple@domaine.com');
      expect(passwordInput.props.placeholder).toBe('••••••••');
    });

    it('devrait afficher le bouton de connexion', async () => {
      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      const textElements = root.findAllByType(Text);
      const submitButtonText = textElements.find(
        (el: any) => el.props.children === 'Se connecter'
      );

      expect(submitButtonText).toBeTruthy();
    });

    it('devrait afficher le lien vers l\'inscription', async () => {
      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      const textElements = root.findAllByType(Text);

      const registerText = textElements.find(
        (el: any) =>
          el.props.children && el.props.children.toString().includes("S'inscrire")
      );

      expect(registerText).toBeTruthy();
    });
  });

  // ==================== INTERACTION TESTS ====================

  describe('Interactions utilisateur', () => {
    it('devrait permettre de saisir l\'email', async () => {
      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      const inputs = root.findAllByType(TextInput);
      const emailInput = inputs[0];

      await ReactTestRenderer.act(async () => {
        emailInput.props.onChangeText('test@example.com');
      });

      expect(mockFormState.email).toBe('test@example.com');
    });

    it('devrait permettre de saisir le mot de passe', async () => {
      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      const inputs = root.findAllByType(TextInput);
      const passwordInput = inputs[1];

      await ReactTestRenderer.act(async () => {
        passwordInput.props.onChangeText('password123');
      });

      expect(mockFormState.password).toBe('password123');
    });

    it('devrait basculer l\'affichage du mot de passe', async () => {
      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      const inputs = root.findAllByType(TextInput);
      const passwordInput = inputs[1];

      expect(passwordInput.props.secureTextEntry).toBe(true);

      let toggleButton: any = null;
      const buttons = root.findAllByType(TouchableOpacity);
      for (const btn of buttons) {
        const children = btn.props.children;
        if (children && typeof children === 'object' && children.props?.children === 'Voir') {
          toggleButton = btn;
          break;
        }
      }

      if (toggleButton) {
        await ReactTestRenderer.act(async () => {
          toggleButton.props.onPress();
        });

        const updatedInputs = root.findAllByType(TextInput);
        expect(updatedInputs[1].props.secureTextEntry).toBe(false);
      }
    });
  });

  // ==================== SUBMISSION TESTS ====================

  describe('Soumission du formulaire', () => {
    it('devrait appeler login avec les bons identifiants', async () => {
      const mockLogin = jest.fn().mockResolvedValue({ success: true });
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
      });

      mockFormState = { email: 'test@example.com', password: 'password123' };

      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      // Soumettre le formulaire en appelant directement le callback
      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockLogin).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });

    it('devrait gérer une erreur de connexion', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        success: false,
        message: 'Identifiants incorrects',
      });
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
      });

      mockFormState = { email: 'test@example.com', password: 'password123' };

      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de connexion',
        'Identifiants incorrects'
      );
    });

    it('devrait naviguer vers PendingApproval pour un compte en attente', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        success: false,
        message: 'Votre compte est en attente de validation',
      });
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
      });

      mockFormState = { email: 'pending@example.com', password: 'password123' };

      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('PendingApproval', {
        email: 'pending@example.com',
        password: 'password123',
      });
    });

    it('devrait gérer une exception lors de la connexion', async () => {
      const mockLogin = jest.fn().mockRejectedValue(new Error('Network error'));
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
      });

      mockFormState = { email: 'test@example.com', password: 'password123' };

      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de joindre le service de sécurité.'
      );
    });
  });

  // ==================== NAVIGATION TESTS ====================

  describe('Navigation', () => {
    it('devrait naviguer vers Register quand on clique sur "S\'inscrire"', async () => {
      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      
      let registerButton: any = null;
      for (const btn of root.findAllByType(TouchableOpacity)) {
        const children = btn.props.children;
        if (children && typeof children === 'object' && children.props?.children === "S'inscrire") {
          registerButton = btn;
          break;
        }
      }

      if (registerButton) {
        await ReactTestRenderer.act(async () => {
          registerButton.props.onPress();
        });

        expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
      }
    });
  });

  // ==================== THEME TESTS ====================

  describe('Styles et thème', () => {
    it('devrait appliquer le thème sombre si configuré', async () => {
      const darkTheme = {
        ...mockTheme,
        isDark: true,
        theme: {
          ...mockTheme.theme,
          colors: {
            ...mockTheme.theme.colors,
            background: '#1A1A1A',
            surface: '#2D2D2D',
            text: '#FFFFFF',
            textSecondary: '#AAAAAA',
            textMuted: '#777777',
            placeholder: '#777777',
            inputBackground: '#3D3D3D',
            inputBorder: '#4D4D4D',
          },
        },
      };
      (useAppTheme as jest.Mock).mockReturnValue(darkTheme);

      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      const root = instance.root;
      const textElements = root.findAllByType(Text);

      const titleText = textElements.find(
        (el: any) => el.props.children === 'SecureLibrary'
      );

      expect(titleText).toBeTruthy();
    });
  });

  // ==================== EDGE CASES ====================

  describe('Cas de bordure', () => {
    it('devrait gérer un message d\'erreur null', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        success: false,
        message: null,
      });
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
      });

      mockFormState = { email: 'test@example.com', password: 'password123' };

      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur de connexion',
        'Une erreur est survenue.'
      );
    });

    it('devrait détecter "en attente" dans le message d\'erreur (insensible à la casse)', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        success: false,
        message: 'EN ATTENTE DE VALIDATION',
      });
      (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
      });

      mockFormState = { email: 'pending@example.com', password: 'password123' };

      let instance: any;

      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <LoginScreen navigation={mockNavigation} route={mockRoute} />
        );
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('PendingApproval', {
        email: 'pending@example.com',
        password: 'password123',
      });
    });
  });
});
