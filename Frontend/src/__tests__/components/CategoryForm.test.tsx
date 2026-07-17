import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import CategoryForm from '@screens/Admin/ManageCategories/CategoryForm';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS ====================

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    ActivityIndicator: 'ActivityIndicator',
    StyleSheet: { create: jest.fn(() => ({})) },
    Alert: { alert: jest.fn() },
    TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
    NativeModules: { DevMenu: null },
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  };
}, { virtual: true });

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@screens/Admin/ManageCategories/styles', () => ({
  styles: {
    modalTitle: {},
    modalInput: {},
    textArea: {},
    modalActions: {},
    modalButton: {},
    modalCancel: {},
    modalCancelText: {},
    modalButtonText: {},
  },
}));

// ==================== TEST SETUP ====================

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

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

describe('CategoryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit.mockReset();
    mockOnCancel.mockReset();
    Alert.alert = jest.fn();
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le titre par défaut', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      const root = instance.root;
      const title = root.find(
        (el: any) =>
          el.props.children &&
          typeof el.props.children === 'string' &&
          el.props.children === 'Nouvelle Catégorie'
      );
      expect(title).toBeDefined();
    });

    it('devrait afficher le titre personnalisé', async () => {
      const customTitle = 'Modifier la Catégorie';
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            title={customTitle}
          />
        );
      });
      const root = instance.root;
      const title = root.find(
        (el: any) =>
          el.props.children &&
          typeof el.props.children === 'string' &&
          el.props.children === customTitle
      );
      expect(title).toBeDefined();
    });

    it('devrait afficher les champs nom et description', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      const root = instance.root;
      const nameInput = findByTestID(root, 'category-form-name');
      const descriptionInput = findByTestID(root, 'category-form-description');
      expect(nameInput).toBeDefined();
      expect(descriptionInput).toBeDefined();
    });

    it('devrait pré-remplir les champs avec les valeurs initiales', async () => {
      const initialName = 'Sciences';
      const initialDescription = 'Livres scientifiques';
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            initialName={initialName}
            initialDescription={initialDescription}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      const root = instance.root;
      const nameInput = findByTestID(root, 'category-form-name');
      const descriptionInput = findByTestID(root, 'category-form-description');
      expect(nameInput.props.value).toBe(initialName);
      expect(descriptionInput.props.value).toBe(initialDescription);
    });

    it('devrait afficher un indicateur de chargement si isSubmitting est true', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            isSubmitting={true}
          />
        );
      });
      const root = instance.root;
      const activityIndicator = root.findAll(
        (el: any) => el.type === 'ActivityIndicator'
      );
      expect(activityIndicator.length).toBeGreaterThan(0);
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions', () => {
    it('devrait permettre de saisir le nom', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      const root = instance.root;
      const nameInput = findByTestID(root, 'category-form-name');
      await ReactTestRenderer.act(async () => {
        changeText(nameInput, 'Nouvelle Catégorie');
      });
      expect(nameInput.props.value).toBe('Nouvelle Catégorie');
    });

    it('devrait permettre de saisir la description (multiligne)', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      const root = instance.root;
      const descriptionInput = findByTestID(root, 'category-form-description');
      // Vérifier que le champ est multiligne
      expect(descriptionInput.props.multiline).toBe(true);
      expect(descriptionInput.props.numberOfLines).toBe(4);
      await ReactTestRenderer.act(async () => {
        changeText(descriptionInput, 'Description longue sur plusieurs lignes');
      });
      expect(descriptionInput.props.value).toBe('Description longue sur plusieurs lignes');
    });

    it('devrait appeler onCancel lorsque l\'on appuie sur Annuler', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      const root = instance.root;
      const cancelButton = findByTestID(root, 'category-form-cancel');
      await ReactTestRenderer.act(async () => {
        cancelButton.props.onPress();
      });
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('devrait appeler onSubmit avec les données du formulaire', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      const root = instance.root;
      const nameInput = findByTestID(root, 'category-form-name');
      const descriptionInput = findByTestID(root, 'category-form-description');
      await ReactTestRenderer.act(async () => {
        changeText(nameInput, 'Sciences');
        changeText(descriptionInput, 'Livres scientifiques');
      });
      const submitButton = findByTestID(root, 'category-form-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Sciences',
        description: 'Livres scientifiques',
      });
    });

    it('devrait appeler onSubmit avec description vide si non remplie', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryForm
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
          />
        );
      });
      const root = instance.root;
      const nameInput = findByTestID(root, 'category-form-name');
      await ReactTestRenderer.act(async () => {
        changeText(nameInput, 'Sciences');
      });
      const submitButton = findByTestID(root, 'category-form-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Sciences',
        description: '',
      });
    });
  });
});
