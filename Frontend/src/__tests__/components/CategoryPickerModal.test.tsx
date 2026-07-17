// __tests__/components/CategoryPickerModal.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import CategoryPickerModal from '@components/CategoryPickerModal';
import { useCategoryStore } from '@store/useCategoryStore';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS ====================

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    FlatList: ({ data, renderItem, keyExtractor, testID }) => {
      return React.createElement(
        'View',
        { testID },
        data?.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          return React.cloneElement(renderItem({ item, index }), { key });
        })
      );
    },
    Modal: ({ visible, children }) => {
      if (!visible) return null;
      return React.createElement('View', { testID: 'modal-view' }, children);
    },
    TextInput: 'TextInput',
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

jest.mock('@components/CategoryPickerModal/styles', () => ({
  styles: {
    overlay: {},
    modalContainer: {},
    header: {},
    title: {},
    closeButton: {},
    closeButtonText: {},
    searchInput: {},
    listContainer: {},
    categoryItem: {},
    categoryName: {},
    categoryCheck: {},
    emptyText: {},
    loader: {},
  },
}));

// ==================== TEST SETUP ====================

const mockCategories = [
  { id: '1', name: 'Sciences', description: 'Livres scientifiques' },
  { id: '2', name: 'Romans', description: 'Romans et fictions' },
  { id: '3', name: 'Littérature', description: 'Littérature classique' },
];

const mockFetchCategories = jest.fn();
const mockOnSelect = jest.fn();
const mockOnClose = jest.fn();

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

describe('CategoryPickerModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchCategories.mockReset();
    mockOnSelect.mockReset();
    mockOnClose.mockReset();
    Alert.alert = jest.fn();

    (useCategoryStore as jest.Mock).mockReturnValue({
      categories: mockCategories,
      loading: false,
      fetchCategories: mockFetchCategories,
    });
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('ne devrait rien afficher si visible est false', async () => {
      const instance = await ReactTestRenderer.act(async () => {
        return ReactTestRenderer.create(
          <CategoryPickerModal
            visible={false}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      const modalView = findByTestID(root, 'modal-view');
      expect(modalView).toBeNull();
    });

    it('devrait afficher le modal si visible est true', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      const modalView = findByTestID(root, 'modal-view');
      expect(modalView).toBeDefined();
    });

    it('devrait afficher le titre "Sélectionner une catégorie"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      const title = root.find(
        (el: any) =>
          el.props.children &&
          typeof el.props.children === 'string' &&
          el.props.children === 'Sélectionner une catégorie'
      );
      expect(title).toBeDefined();
    });

    it('devrait afficher la liste des catégories', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      mockCategories.forEach((cat) => {
        const categoryItem = root.find(
          (el: any) =>
            el.props.testID && el.props.testID === `category-item-${cat.id}`
        );
        expect(categoryItem).toBeDefined();
      });
    });

    it('devrait afficher un indicateur de chargement si loading est true', async () => {
      (useCategoryStore as jest.Mock).mockReturnValue({
        categories: [],
        loading: true,
        fetchCategories: mockFetchCategories,
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      const loader = findByTestID(root, 'category-loader');
      expect(loader).toBeDefined();
    });

    it('devrait afficher un message si aucune catégorie n\'est disponible', async () => {
      (useCategoryStore as jest.Mock).mockReturnValue({
        categories: [],
        loading: false,
        fetchCategories: mockFetchCategories,
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      const emptyText = root.find(
        (el: any) =>
          el.props.children &&
          typeof el.props.children === 'string' &&
          el.props.children === 'Aucune catégorie disponible'
      );
      expect(emptyText).toBeDefined();
    });

    it('devrait afficher une coche sur la catégorie sélectionnée', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue="1"
          />
        );
      });
      const root = instance.root;
      const checkmark = root.find(
        (el: any) =>
          el.props.children &&
          typeof el.props.children === 'string' &&
          el.props.children === '✓'
      );
      expect(checkmark).toBeDefined();
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions', () => {
    it('devrait appeler onClose lorsque l\'on appuie sur le bouton de fermeture', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      const closeButton = root.find(
        (el: any) =>
          el.props.testID && el.props.testID === 'category-modal-close'
      );
      expect(closeButton).toBeDefined();
      await ReactTestRenderer.act(async () => {
        closeButton.props.onPress();
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('devrait appeler onSelect avec l\'ID de la catégorie lors du clic', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      const categoryItem = root.find(
        (el: any) =>
          el.props.testID && el.props.testID === 'category-item-1'
      );
      expect(categoryItem).toBeDefined();
      await ReactTestRenderer.act(async () => {
        categoryItem.props.onPress();
      });
      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });

    it('devrait rechercher une catégorie', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      const root = instance.root;
      const searchInput = root.find(
        (el: any) => el.props.testID === 'category-search'
      );
      expect(searchInput).toBeDefined();
      await ReactTestRenderer.act(async () => {
        changeText(searchInput, 'Sciences');
      });
      // Après recherche, seule la catégorie "Sciences" doit être visible
      const items = root.findAll(
        (el: any) =>
          el.props.testID && el.props.testID.startsWith('category-item-')
      );
      expect(items.length).toBe(1);
    });
  });

  // ===== FETCH CATEGORIES =====
  describe('Chargement des catégories', () => {
    it('devrait appeler fetchCategories au montage', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <CategoryPickerModal
            visible={true}
            onSelect={mockOnSelect}
            onClose={mockOnClose}
            selectedValue={null}
          />
        );
      });
      expect(mockFetchCategories).toHaveBeenCalled();
    });
  });
});
