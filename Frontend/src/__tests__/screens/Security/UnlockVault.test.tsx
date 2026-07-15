import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import UnlockVaultScreen from '@screens/Security/UnlockVault';
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

jest.mock('@screens/Security/UnlockVault/styles', () => ({
  styles: {
    safeArea: {},
    container: {},
    iconContainer: {},
    icon: {},
    title: {},
    subtitle: {},
    inputContainer: {},
    input: {},
    errorText: {},
    submitButton: {},
    submitButtonText: {},
    biometricButton: {},
    biometricText: {},
  },
}));

jest.mock('@screens/Security/UnlockVault/schema', () => ({
  unlockVaultSchema: {},
  UnlockVaultFormType: {},
}));

// ========== MOCK REACT-HOOK-FORM ==========
let mockFormState = { pin: '' };
let mockErrors = {};
let onSubmitCallback: any = null;
let mockReset = jest.fn();

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
      reset: mockReset,
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
  mockFormState = { pin: '' };
  mockErrors = {};
  onSubmitCallback = null;
  mockReset.mockClear();
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
      primary: '#007AFF',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
    radius: { md: 8 },
  },
  isDark: false,
};

const mockUnlockVault = jest.fn();

(useAppTheme as jest.Mock).mockReturnValue(mockTheme);

describe('UnlockVaultScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetFormState();
    (useVault as jest.Mock).mockReturnValue({
      unlockVault: mockUnlockVault,
    });
    Alert.alert = jest.fn();
  });

  // ===== RENDU =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le champ PIN', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });
      const root = instance.root;
      const pinInput = root.find((el: any) => el.props.testID === 'unlock-pin-input');
      expect(pinInput).toBeDefined();
    });

    it('devrait afficher le bouton "Déverrouiller"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });
      const root = instance.root;
      const submitButton = root.find((el: any) => el.props.testID === 'unlock-submit-button');
      expect(submitButton).toBeDefined();
    });

    it('devrait afficher le bouton biométrique', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });
      const root = instance.root;
      const bioButton = root.find((el: any) => el.props.testID === 'unlock-biometric-button');
      expect(bioButton).toBeDefined();
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions utilisateur', () => {
    it('devrait permettre de saisir le PIN', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });
      const root = instance.root;
      const pinInput = root.find((el: any) => el.props.testID === 'unlock-pin-input');

      await ReactTestRenderer.act(async () => {
        pinInput.props.onChangeText('1234');
      });
      expect(mockFormState.pin).toBe('1234');
    });

    it('devrait afficher l\'indicateur de chargement lors de la soumission', async () => {
      mockUnlockVault.mockImplementation(() => new Promise(() => {})); // never resolves

      mockFormState = { pin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });
      const root = instance.root;
      const submitButton = root.find((el: any) => el.props.testID === 'unlock-submit-button');

      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      const indicator = root.find((el: any) => el.props.testID === 'unlock-activity-indicator');
      expect(indicator).toBeDefined();
    });

    it('devrait afficher une alerte biométrique lors du clic sur le bouton biométrique', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });
      const root = instance.root;
      const bioButton = root.find((el: any) => el.props.testID === 'unlock-biometric-button');

      await ReactTestRenderer.act(async () => {
        bioButton.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Biométrie',
        'FaceID / TouchID bientôt disponible.'
      );
    });
  });

  // ===== SOUMISSION =====
  describe('Soumission', () => {
    it('devrait appeler unlockVault avec le PIN', async () => {
      mockUnlockVault.mockResolvedValue(true);

      mockFormState = { pin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockUnlockVault).toHaveBeenCalledWith('1234');
    });

    it('ne devrait pas afficher d\'alerte si le déverrouillage réussit', async () => {
      mockUnlockVault.mockResolvedValue(true);

      mockFormState = { pin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('devrait afficher une alerte d\'échec si unlockVault retourne false', async () => {
      mockUnlockVault.mockResolvedValue(false);

      mockFormState = { pin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Échec',
        'Code PIN incorrect.'
      );
    });

    it('devrait réinitialiser le formulaire après un échec', async () => {
      mockUnlockVault.mockResolvedValue(false);

      mockFormState = { pin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockReset).toHaveBeenCalledWith({ pin: '' });
    });

    it('devrait gérer une erreur de unlockVault', async () => {
      mockUnlockVault.mockRejectedValue(new Error('Erreur'));

      mockFormState = { pin: '1234' };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });

      await ReactTestRenderer.act(async () => {
        await submitForm();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de vérifier le code PIN.'
      );
    });
  });

  // ===== VALIDATION =====
  describe('Validation', () => {
    it('devrait afficher une erreur si le PIN est invalide', async () => {
      mockErrors = { pin: { message: 'Le code PIN doit contenir 4 chiffres' } };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(<UnlockVaultScreen />);
      });
      const root = instance.root;
      const errorText = root.findAllByType(Text).find((el: any) =>
        el.props.children === 'Le code PIN doit contenir 4 chiffres'
      );
      expect(errorText).toBeDefined();
    });
  });
});
