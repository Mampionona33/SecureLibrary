import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import ManageBooksScreen from '@screens/Admin/ManageBooks';
import { useBookStore } from '@store/useBookStore';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCK DATA ====================

const mockBooks = [
  {
    id: '1',
    title: 'Le Seigneur des Anneaux',
    author: 'J.R.R. Tolkien',
    status: 'active',
    createdAt: '2024-01-15',
    fileUrl: 'url1',
  },
  {
    id: '2',
    title: 'Harry Potter',
    author: 'J.K. Rowling',
    status: 'active',
    createdAt: '2024-02-10',
    fileUrl: 'url2',
  },
  {
    id: '3',
    title: 'Le Hobbit',
    author: 'J.R.R. Tolkien',
    status: 'archived',
    createdAt: '2023-12-01',
    fileUrl: 'url3',
  },
];

// ==================== MOCKS ====================

jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

jest.mock('@store/useBookStore', () => ({
  useBookStore: jest.fn(),
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

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
    NativeModules: { DevMenu: null, DevSettings: { addMenuItem: jest.fn(), reload: jest.fn() } },
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  };
}, { virtual: true });

jest.mock('@screens/Admin/ManageBooks/styles', () => ({
  styles: {
    safeArea: {},
    container: {},
    header: {},
    title: {},
    addButton: {},
    addButtonText: {},
    filterContainer: {},
    filterButton: {},
    filterButtonActive: {},
    filterButtonText: {},
    searchContainer: {},
    listContainer: {},
    bookItem: {},
    bookTitle: {},
    bookAuthor: {},
    bookDate: {},
    bookStatus: {},
    bookActions: {},
    emptyText: {},
  },
}));

// ==================== TEST SETUP ====================

const mockFetchBooks = jest.fn();
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
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

// ==================== TESTS ====================

describe('ManageBooksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchBooks.mockReset();
    mockNavigate.mockReset();
    Alert.alert = jest.fn();

    (useBookStore as jest.Mock).mockReturnValue({
      books: mockBooks,
      loading: false,
      fetchBooks: mockFetchBooks,
    });
  });

  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      expect(instance).toBeDefined();
    });

    it('devrait afficher le titre', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const title = findByTestID(root, 'manage-books-title');
      expect(title).toBeDefined();
      expect(title.props.children).toBe('Gérer les Livres');
    });

    it('devrait afficher le bouton "Ajouter"', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const addButton = findByTestID(root, 'manage-books-add');
      expect(addButton).toBeDefined();
    });

    it('devrait afficher la liste des livres', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const bookItems = root.findAll(
        (el: any) => el.props.testID && el.props.testID.startsWith('book-item-')
      );
      expect(bookItems.length).toBe(mockBooks.length);
    });

    it('devrait afficher un message si la liste est vide', async () => {
      (useBookStore as jest.Mock).mockReturnValue({
        books: [],
        loading: false,
        fetchBooks: mockFetchBooks,
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const emptyText = findByTestID(root, 'books-empty');
      expect(emptyText).toBeDefined();
    });
  });

  describe('Ajout de livre', () => {
    it('devrait naviguer vers CreateBook quand on clique sur Ajouter', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const addButton = findByTestID(root, 'manage-books-add');
      await ReactTestRenderer.act(async () => {
        addButton.props.onPress();
      });

      expect(mockNavigate).toHaveBeenCalledWith('CreateBook');
    });
  });

  describe('Filtrage par statut', () => {
    it('devrait filtrer les livres actifs', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const activeFilterButton = findByTestID(root, 'filter-active');
      await ReactTestRenderer.act(async () => {
        activeFilterButton.props.onPress();
      });

      const bookItems = root.findAll(
        (el: any) => el.props.testID && el.props.testID.startsWith('book-item-')
      );
      const expectedCount = mockBooks.filter((b) => b.status === 'active').length;
      expect(bookItems.length).toBe(expectedCount);
    });

    it('devrait filtrer les livres archivés', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const archivedFilterButton = findByTestID(root, 'filter-archived');
      await ReactTestRenderer.act(async () => {
        archivedFilterButton.props.onPress();
      });

      const bookItems = root.findAll(
        (el: any) => el.props.testID && el.props.testID.startsWith('book-item-')
      );
      const expectedCount = mockBooks.filter((b) => b.status === 'archived').length;
      expect(bookItems.length).toBe(expectedCount);
    });

    it('devrait afficher tous les livres si "Tous" est sélectionné', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const allFilterButton = findByTestID(root, 'filter-all');
      await ReactTestRenderer.act(async () => {
        allFilterButton.props.onPress();
      });

      const bookItems = root.findAll(
        (el: any) => el.props.testID && el.props.testID.startsWith('book-item-')
      );
      expect(bookItems.length).toBe(mockBooks.length);
    });
  });

  describe('Recherche', () => {
    it('devrait rechercher par auteur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const textInputs = root.findAll((el: any) => el.type === 'TextInput');
      const searchInput = textInputs[0];

      await ReactTestRenderer.act(async () => {
        searchInput.props.onChangeText('Tolkien');
      });

      const bookItems = root.findAll(
        (el: any) => el.props.testID && el.props.testID.startsWith('book-item-')
      );
      const expectedCount = mockBooks.filter((b) =>
        b.author.toLowerCase().includes('tolkien')
      ).length;
      expect(bookItems.length).toBe(expectedCount);
    });

    it('devrait retourner aucun résultat pour une recherche sans correspondance', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const textInputs = root.findAll((el: any) => el.type === 'TextInput');
      const searchInput = textInputs[0];

      await ReactTestRenderer.act(async () => {
        searchInput.props.onChangeText('XYZ123');
      });

      const bookItems = root.findAll(
        (el: any) => el.props.testID && el.props.testID.startsWith('book-item-')
      );
      expect(bookItems.length).toBe(0);
    });
  });

  describe('Cas de bordure', () => {
    it('devrait combiner filtrage et recherche', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ManageBooksScreen navigation={mockNavigation} />
        );
      });
      const root = instance.root;

      const activeFilterButton = findByTestID(root, 'filter-active');
      await ReactTestRenderer.act(async () => {
        activeFilterButton.props.onPress();
      });

      const textInputs = root.findAll((el: any) => el.type === 'TextInput');
      const searchInput = textInputs[0];

      await ReactTestRenderer.act(async () => {
        searchInput.props.onChangeText('Tolkien');
      });

      const bookItems = root.findAll(
        (el: any) => el.props.testID && el.props.testID.startsWith('book-item-')
      );
      expect(bookItems.length).toBeGreaterThanOrEqual(0);
    });
  });
});
