import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import ManageCategoriesScreen from '@screens/Admin/ManageCategories';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS ====================

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    FlatList: ({ data, renderItem, keyExtractor, ListEmptyComponent, testID }) => {
      if (!data || data.length === 0) {
        return ListEmptyComponent || null;
      }
      return React.createElement(
        'View',
        { testID },
        data?.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          return React.cloneElement(renderItem({ item, index }), { key });
        })
      );
    },
    Modal: 'Modal',
    ActivityIndicator: 'ActivityIndicator',
    SafeAreaView: 'SafeAreaView',
    StyleSheet: { create: jest.fn(() => ({})) },
    Alert: { alert: jest.fn() },
    TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
    NativeModules: { DevMenu: null },
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  };
}, { virtual: true });

jest.mock('@store/useCategoryStore', () => ({
  useCategoryStore: jest.fn(),
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => callback()),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
}));

jest.mock('@components/SearchBar', () => {
  const React = require('react');
  return {
    SearchBar: ({ value, onChangeText, placeholder }) => {
      return React.createElement(
        'View',
        { testID: 'search-bar' },
        React.createElement('Text', null, `SearchBar: ${value}`),
        React.createElement(
          'TouchableOpacity',
          { testID: 'search-change', onPress: () => onChangeText('Sciences') },
          React.createElement('Text', null, 'Change')
        )
      );
    },
  };
});

jest.mock('@screens/Admin/ManageCategories/styles', () => ({
  styles: {
    safeArea: {},
    container: {},
    header: {},
    title: {},
    addButton: {},
    addButtonText: {},
    searchContainer: {},
    listContainer: {},
    categoryItem: {},
    categoryInfo: {},
    categoryName: {},
    categoryDescription: {},
    categoryActions: {},
    editButton: {},
    editButtonText: {},
    deleteButton: {},
    deleteButtonText: {},
    emptyText: {},
    modalOverlay: {},
    modalContent: {},
    modalTitle: {},
    modalInput: {},
    modalActions: {},
    modalButton: {},
    modalButtonText: {},
    modalCancel: {},
    modalCancelText: {},
    loader: {},
  },
}));

// ==================== TEST SETUP ====================

const mockFetchCategories = jest.fn();
const mockCreateCategory = jest.fn();
const mockUpdateCategory = jest.fn();
const mockDeleteCategory = jest.fn();
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

const mockCategories = [
  { id: '1', name: 'Sciences', description: 'Livres scientifiques', parent: null },
  { id: '2', name: 'Romans', description: 'Romans et fictions', parent: null },
  { id: '3', name: 'Littérature', description: 'Littérature classique', parent: null },
];

(useAppTheme as jest.Mock).mockReturnValue({
  theme: {
    colors: {
      background: '#F5F5F5',
      surface: '#FFFFFF',
      border: '#E0E0E0',
      text: '#000000',
      textSecondary: '#666666',
      textMuted: '#999999',
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

describe('ManageCategoriesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchCategories.mockReset();
    mockCreateCategory.mockReset();
    mockUpdateCategory.mockReset();
    mockDeleteCategory.mockReset();
    mockNavigate.mockReset();
    mockGoBack.mockReset();
    Alert.alert = jest.fn();

    (useCategoryStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        categories: mockCategories,
        loading: false,
        fetchCategories: mockFetchCategories,
        createCategory: mockCreateCategory,
        updateCategory: mockUpdateCategory,
        deleteCategory: mockDeleteCategory,
      };
      return selector ? selector(state) : state;
    });
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      expect(instance).toBeDefined();
    });

    it('devrait afficher le titre', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const title = findByTestID(root, 'manage-categories-title');
      expect(title).toBeDefined();
      expect(title.props.children).toBe('Gérer les Catégories');
    });

    it('devrait afficher le bouton "Ajouter"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const addButton = findByTestID(root, 'manage-categories-add');
      expect(addButton).toBeDefined();
    });

    it('devrait afficher la SearchBar', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const searchBar = findByTestID(root, 'search-bar');
      expect(searchBar).toBeDefined();
    });

    it('devrait afficher la liste des catégories', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      mockCategories.forEach((cat) => {
        const item = findByTestID(root, `category-item-${cat.id}`);
        expect(item).toBeDefined();
      });
    });

    it('devrait afficher un message si la liste est vide', async () => {
      (useCategoryStore as jest.Mock).mockImplementation((selector) => {
        const state = {
          categories: [],
          loading: false,
          fetchCategories: mockFetchCategories,
          createCategory: mockCreateCategory,
          updateCategory: mockUpdateCategory,
          deleteCategory: mockDeleteCategory,
        };
        return selector ? selector(state) : state;
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const emptyText = findByTestID(root, 'categories-empty');
      expect(emptyText).toBeDefined();
    });

    it('devrait appeler fetchCategories au montage', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      expect(mockFetchCategories).toHaveBeenCalled();
    });
  });

  // ===== FILTER =====
  describe('Filtrage', () => {
    it.skip('devrait filtrer les catégories selon la recherche', async () => {});
  });

  // ===== CRUD =====
  describe('Création', () => {
    it('devrait ouvrir le modal et créer une catégorie', async () => {
      mockCreateCategory.mockResolvedValue({
        id: '4',
        name: 'Nouvelle',
        description: undefined,
        parent: null,
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const addButton = findByTestID(root, 'manage-categories-add');
      expect(addButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        addButton.props.onPress();
      });

      const modalTitle = findByTestID(root, 'category-modal-title');
      expect(modalTitle.props.children).toBe('Nouvelle Catégorie');

      const nameInput = findByTestID(root, 'category-modal-name');
      expect(nameInput).toBeDefined();

      await ReactTestRenderer.act(async () => {
        changeText(nameInput, 'Nouvelle');
      });

      const submitButton = findByTestID(root, 'category-modal-submit');
      expect(submitButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: 'Nouvelle',
        description: undefined,
        parent_id: null,
      });
    });
  });

  describe('Édition', () => {
    it('devrait ouvrir le modal avec les données pré-remplies et mettre à jour', async () => {
      mockUpdateCategory.mockResolvedValue({
        id: '1',
        name: 'Sciences (modifié)',
        description: 'Livres scientifiques',
        parent: null,
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const editButton = findByTestID(root, 'category-edit-1');
      expect(editButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        editButton.props.onPress();
      });

      const modalTitle = findByTestID(root, 'category-modal-title');
      expect(modalTitle.props.children).toBe('Modifier la Catégorie');

      const nameInput = findByTestID(root, 'category-modal-name');
      expect(nameInput.props.value).toBe('Sciences');

      await ReactTestRenderer.act(async () => {
        changeText(nameInput, 'Sciences (modifié)');
      });

      const submitButton = findByTestID(root, 'category-modal-submit');
      await ReactTestRenderer.act(async () => {
        submitButton.props.onPress();
      });

      expect(mockUpdateCategory).toHaveBeenCalledWith('1', {
        name: 'Sciences (modifié)',
        description: 'Livres scientifiques',
        parent_id: null,
      });
    });
  });

  describe('Suppression', () => {
    it('devrait demander confirmation et supprimer', async () => {
      let alertCallback: any;
      Alert.alert = jest.fn((title, message, buttons) => {
        const deleteButton = buttons.find((b: any) => b.text === 'Supprimer');
        if (deleteButton) {
          alertCallback = deleteButton.onPress;
        }
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageCategoriesScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const deleteButton = findByTestID(root, 'category-delete-1');
      expect(deleteButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        deleteButton.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirmer la suppression',
        'Voulez-vous vraiment supprimer la catégorie "Sciences" ?',
        expect.any(Array)
      );

      expect(alertCallback).toBeDefined();
      await ReactTestRenderer.act(async () => {
        await alertCallback();
      });

      expect(mockDeleteCategory).toHaveBeenCalledWith('1');
    });
  });
});
