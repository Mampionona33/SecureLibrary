import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import SetupVaultScreen from '@screens/Security/SetupVault';
import { useVault } from '@context/VaultContext';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS ====================

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  SafeAreaView: 'SafeAreaView',
  StyleSheet: { create: jest.fn(() => ({})) },
  Alert: { alert: jest.fn() },
  Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
  NativeModules: { DevMenu: null },
}), { virtual: true });

jest.mock('@context/VaultContext', () => ({
  useVault: jest.fn(),
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@screens/Security/SetupVault/styles', () => ({
  styles: {
    safeArea: {},
    container: {},
    iconContainer: {},
    icon: {},
    title: {},
    subtitle: {},
    inputContainer: {},
    label: {},
    input: {},
    errorText: {},
    submitButton: {},
    submitButtonText: {},
  },
}));

jest.mock('@screens/Security/SetupVault/schema', () => ({
  setupVaultSchema: {},
  SetupVaultFormType: {},
}));

// ========== MOCK REACT-HOOK-FORM ==========
let mockFormState = { pin: '', confirmPin: '' };
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
  mockFormState = { pin: '', confirmPin: '' };
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
      text: '#000000',
      textSecondary: '#666666',
      placeholder: '#999999',
      inputBackground: '#F8F8F8',
      inputBorder: '#D0D0D0',
      danger: '#FF3B30',
      buttonPrimary: '#007AFF',
      buttonPrimaryText: '#FFFFFF',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
    radius: { md: 8 },
  },
  isDark: false,
};

const mockSetupLocalVault = jest.fn();

(useAppTheme as jest.Mock).mockReturnValue(mockTheme);

describe('SetupVaultScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetFormState();
    (useVault as jest.Mock).mockReturnValue({
      setupLocalVault: mockSetupLocalVault,
    });
    Alert.alert = jest.fn();
  });

  // ===== RENDU =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher les champs PIN et Confirmation', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });
      const root = instance.root;

      const pinInput = root.find((el: any) => el.props.testID === 'setup-pin-input');
      const confirmInput = root.find((el: any) => el.props.testID === 'setup-confirm-pin-input');

      expect(pinInput).toBeDefined();
      expect(confirmInput).toBeDefined();
    });

    it('devrait afficher le bouton "Sécuriser mon accès"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });
      const root = instance.root;
      const submitButton = root.find((el: any) => el.props.testID === 'setup-submit-button');
      expect(submitButton).toBeDefined();
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions utilisateur', () => {
    it('devrait permettre de saisir le PIN', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });
      const root = instance.root;
      const pinInput = root.find((el: any) => el.props.testID === 'setup-pin-input');

      await ReactTestRenderer.act(async () => {
        pinInput.props.onChangeText('1234');
      });
      expect(mockFormState.pin).toBe('1234');
    });

    it('devrait permettre de saisir la confirmation du PIN', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });
      const root = instance.root;
      const confirmInput = root.find((el: any) => el.props.testID === 'setup-confirm-pin-input');

      await ReactTestRenderer.act(async () => {
        confirmInput.props.onChangeText('1234');
      });
      expect(mockFormState.confirmPin).toBe('1234');
    });

    it('devrait afficher l\'indicateur de chargement lors de la soumission', async () => {
      mockSetupLocalVault.mockImplementation(() => new Promise(() => {})); // never resolves

      mockFormState = { pin: '1234', confirmPin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });
      const root = instance.root;
      const submitButton = root.find((el: any) => el.props.testID === 'setup-submit-button');

      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      const indicator = root.find((el: any) => el.props.testID === 'setup-activity-indicator');
      expect(indicator).toBeDefined();
    });
  });

  // ===== SOUMISSION =====
  describe('Soumission', () => {
    it('devrait appeler setupLocalVault avec le PIN', async () => {
      mockSetupLocalVault.mockResolvedValue(undefined);

      mockFormState = { pin: '1234', confirmPin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSetupLocalVault).toHaveBeenCalledWith('1234');
    });

    it('devrait afficher une alerte de succès après configuration', async () => {
      mockSetupLocalVault.mockResolvedValue(undefined);

      mockFormState = { pin: '1234', confirmPin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Succès',
        'Votre coffre local est sécurisé !'
      );
    });

    it('devrait gérer une erreur de setupLocalVault', async () => {
      mockSetupLocalVault.mockRejectedValue(new Error('Erreur'));

      mockFormState = { pin: '1234', confirmPin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de configurer le coffre local.'
      );
    });
  });

  // ===== VALIDATION =====
  describe('Validation', () => {
    it('devrait afficher une erreur si le PIN est invalide', async () => {
      mockErrors = { pin: { message: 'Le code PIN doit contenir 4 chiffres' } };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });
      const root = instance.root;
      const errorText = root.findAllByType(Text).find((el: any) =>
        el.props.children === 'Le code PIN doit contenir 4 chiffres'
      );
      expect(errorText).toBeDefined();
    });

    it('devrait afficher une erreur si les PIN ne correspondent pas', async () => {
      mockErrors = { confirmPin: { message: 'Les codes PIN ne correspondent pas' } };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<SetupVaultScreen />);
      });
      const root = instance.root;
      const errorText = root.findAllByType(Text).find((el: any) =>
        el.props.children === 'Les codes PIN ne correspondent pas'
      );
      expect(errorText).toBeDefined();
    });
  });
});
