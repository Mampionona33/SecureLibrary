// __tests__/screens/Admin/CreateBook.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import CreateBookScreen from '@screens/Admin/CreateBook';
import { useBookStore } from '@store/useBookStore';
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

// Mock du store
jest.mock('@store/useBookStore', () => ({
  useBookStore: jest.fn(),
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock de react-hook-form avec gestion des données
let mockFormData = {
  title: '',
  author: '',
  category: '',
  year: undefined,
  isbn: '',
  description: '',
};

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    control: {},
    handleSubmit: (callback: any) => {
      return () => callback(mockFormData);
    },
    formState: { errors: {} },
    reset: jest.fn(),
    setValue: jest.fn(),
  })),
  Controller: ({ render }: any) => {
    const field = {
      onChange: jest.fn(),
      onBlur: jest.fn(),
      value: '',
    };
    return render({ field, formState: { errors: {} } });
  },
}));

// Mock valibot
jest.mock('valibot', () => ({
  safeParse: jest.fn(() => ({ success: true, issues: [] })),
  object: jest.fn(),
  string: jest.fn(),
  minLength: jest.fn(),
  optional: jest.fn(),
  nullable: jest.fn(),
  number: jest.fn(),
  integer: jest.fn(),
  pipe: jest.fn(),
}));

jest.mock('@screens/Admin/CreateBook/schema', () => ({
  createBookSchema: {},
}));

jest.mock('@screens/Admin/CreateBook/styles', () => ({
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
    textArea: {},
    fieldErrorText: {},
    pickerContainer: {},
    pickerButton: {},
    pickerButtonText: {},
    submitButton: {},
    submitButtonText: {},
    submitButtonDisabled: {},
    filePickerButton: {},
    filePickerText: {},
  },
}));

// ==================== TEST SETUP ====================

const mockCreateBook = jest.fn();
const mockFetchBooks = jest.fn();
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

// Le store Zustand avec le sélecteur
(useBookStore as jest.Mock).mockImplementation((selector) => {
  const state = {
    createBook: mockCreateBook,
    fetchBooks: mockFetchBooks,
  };
  return selector ? selector(state) : state;
});

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

describe('CreateBookScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateBook.mockReset();
    mockFetchBooks.mockReset();
    mockNavigate.mockReset();
    mockGoBack.mockReset();
    Alert.alert = jest.fn();
    // Réinitialiser les données du formulaire
    mockFormData = {
      title: '',
      author: '',
      category: '',
      year: undefined,
      isbn: '',
      description: '',
    };
    // Réinitialiser le mock du store
    (useBookStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        createBook: mockCreateBook,
        fetchBooks: mockFetchBooks,
      };
      return selector ? selector(state) : state;
    });
    // Réinitialiser le mock de valibot
    (v.safeParse as jest.Mock).mockImplementation(() => ({
      success: true,
      issues: [],
    }));
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateBookScreen navigation={mockNavigation} />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le titre', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateBookScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const title = findByTestID(root, 'create-book-title');
      expect(title).toBeDefined();
      expect(title.props.children).toBe('Nouveau Livre');
    });

    it('devrait afficher tous les champs', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateBookScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      expect(findByTestID(root, 'create-book-title-input')).toBeDefined();
      expect(findByTestID(root, 'create-book-author-input')).toBeDefined();
      expect(findByTestID(root, 'create-book-category-input')).toBeDefined();
      expect(findByTestID(root, 'create-book-year-input')).toBeDefined();
      expect(findByTestID(root, 'create-book-isbn-input')).toBeDefined();
      expect(findByTestID(root, 'create-book-description-input')).toBeDefined();
    });

    it('devrait afficher le bouton de soumission', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateBookScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const submitButton = findByTestID(root, 'create-book-submit');
      expect(submitButton).toBeDefined();
    });
  });

  // ===== VALIDATION =====
  describe('Validation', () => {
    it('devrait afficher des erreurs de validation quand les champs obligatoires sont vides', async () => {
      (v.safeParse as jest.Mock).mockImplementationOnce(() => ({
        success: false,
        issues: [
          { path: [{ key: 'title' }], message: 'Le titre est requis' },
          { path: [{ key: 'author' }], message: "L'auteur est requis" },
        ],
      }));

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateBookScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const submitButton = findByTestID(root, 'create-book-submit');

      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      const titleError = findByTestID(root, 'create-book-title-error');
      const authorError = findByTestID(root, 'create-book-author-error');
      expect(titleError).toBeDefined();
      expect(authorError).toBeDefined();
    });
  });

  // ===== SUBMISSION =====
  describe('Soumission', () => {
    it('devrait créer un livre avec succès', async () => {
      (v.safeParse as jest.Mock).mockReturnValue({ success: true, issues: [] });
      mockCreateBook.mockResolvedValue({ id: 'new-id' });

      // Pré-remplir les données du formulaire
      mockFormData = {
        title: 'Le Seigneur des Anneaux',
        author: 'J.R.R. Tolkien',
        category: '',
        year: undefined,
        isbn: '',
        description: '',
      };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateBookScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      // Simuler la saisie pour déclencher les changements (optionnel)
      // Le formulaire est déjà rempli via mockFormData

      const submitButton = findByTestID(root, 'create-book-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });

      expect(mockCreateBook).toHaveBeenCalledWith({
        title: 'Le Seigneur des Anneaux',
        author: 'J.R.R. Tolkien',
        category: null,
        year: null,
        isbn: null,
        description: null,
      });
      expect(mockFetchBooks).toHaveBeenCalledWith(true);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Succès',
        'Le livre a été créé avec succès.',
        expect.any(Array)
      );
    });

    it('devrait gérer une erreur API', async () => {
      (v.safeParse as jest.Mock).mockReturnValue({ success: true, issues: [] });
      mockCreateBook.mockRejectedValue(new Error('Erreur création'));

      mockFormData = {
        title: 'Titre',
        author: 'Auteur',
        category: '',
        year: undefined,
        isbn: '',
        description: '',
      };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateBookScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const submitButton = findByTestID(root, 'create-book-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });

      const apiError = findByTestID(root, 'create-book-api-error');
      expect(apiError).toBeDefined();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Erreur création'
      );
    });
  });

  // ===== NAVIGATION =====
  describe('Navigation', () => {
    it('devrait naviguer en arrière après succès', async () => {
      (v.safeParse as jest.Mock).mockReturnValue({ success: true, issues: [] });
      mockCreateBook.mockResolvedValue({});

      mockFormData = {
        title: 'Titre',
        author: 'Auteur',
        category: '',
        year: undefined,
        isbn: '',
        description: '',
      };

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CreateBookScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const submitButton = findByTestID(root, 'create-book-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Succès',
        'Le livre a été créé avec succès.',
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
      await okButton.onPress();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
