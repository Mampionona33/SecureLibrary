import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import BookListScreen from '@screens/Main/BookList';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCK DATA ====================

const mockCategories = [
  { id: 'all', name: 'Tous' },
  { id: '1', name: 'Romans' },
  { id: '2', name: 'Sciences' },
];

const mockBooks = [
  {
    id: '1',
    title: 'Le Livre',
    author: 'Auteur',
    categoryId: '1',
    coverEmoji: '📖',
    fileUrl: 'url1',
  },
  {
    id: '2',
    title: 'La Science',
    author: 'Scientifique',
    categoryId: '2',
    coverEmoji: '🔬',
    fileUrl: 'url2',
  },
];

// ==================== MOCKS ====================

jest.mock('@env', () => ({
  API_URL: 'http://127.0.0.1:8000/api',
}));

jest.mock('@screens/Main/BookList/mockData', () => ({
  MOCK_CATEGORIES: mockCategories,
  MOCK_BOOKS: mockBooks,
}));

jest.mock('@screens/Main/BookList/styles', () => ({
  styles: {
    safeArea: {},
    header: {},
    headerTitle: {},
    headerSubtitle: {},
    categoriesContainer: {},
    categoryBadge: {},
    categoryBadgeActive: {},
    categoryText: {},
    categoryTextActive: {},
    listContainer: {},
    bookCard: {},
    coverContainer: {},
    coverEmoji: {},
    infoContainer: {},
    bookTitle: {},
    bookAuthor: {},
    emptyText: {},
  },
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@navigation/types', () => ({
  MainStackParamList: {},
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
    TouchableOpacity: 'TouchableOpacity',
    SafeAreaView: 'SafeAreaView',
    ScrollView: 'ScrollView',
    FlatList: ({ data, renderItem, keyExtractor, ListEmptyComponent, testID }: any) => {
      if (!data || data.length === 0) {
        return ListEmptyComponent || null;
      }
      return React.createElement(
        'View',
        { testID },
        data.map((item: any, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          const element = renderItem({ item, index });
          return React.cloneElement(element, { key });
        })
      );
    },
    StyleSheet: { create: jest.fn(() => ({})) },
    TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
    NativeModules: { DevMenu: null, DevSettings: { addMenuItem: jest.fn(), reload: jest.fn() } },
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  };
}, { virtual: true });

// ==================== TEST SETUP ====================

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  key: 'booklist',
  name: 'BookList',
  params: {},
};

(useAppTheme as jest.Mock).mockReturnValue({
  theme: {
    colors: {
      text: '#000',
      textSecondary: '#666',
      background: '#fff',
      primary: '#007AFF',
      border: '#E0E0E0',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 20,
      xl: 24,
    },
  },
  isDark: false,
});

// ==================== TESTS ====================

describe('BookListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookListScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le titre et le sous-titre', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookListScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const root = instance.root;
      const titleElements = root.findAll((el: any) => el.props.testID === 'booklist-header-title');
      const subtitleElements = root.findAll((el: any) => el.props.testID === 'booklist-header-subtitle');
      
      expect(titleElements.length).toBeGreaterThan(0);
      expect(subtitleElements.length).toBeGreaterThan(0);
      expect(titleElements[0].props.children).toBe('Bibliothèque Archives');
      expect(subtitleElements[0].props.children).toBe('Sélectionnez un document crypté à décoder');
    });

    it('devrait rendre deux FlatList (catégories et livres)', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookListScreen navigation={mockNavigation} route={mockRoute} />
        );
      });
      const root = instance.root;
      const categoriesFlatList = root.findAll((el: any) => el.props.testID === 'booklist-categories');
      const booksFlatList = root.findAll((el: any) => el.props.testID === 'booklist-books');
      expect(categoriesFlatList.length).toBeGreaterThan(0);
      expect(booksFlatList.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it.skip('devrait filtrer les livres lors du clic sur une catégorie', async () => {});
    it.skip('devrait naviguer vers BookReader lors du clic sur un livre', async () => {});
  });

  describe('Navigation', () => {
    it.skip('devrait naviguer avec les bons paramètres', async () => {});
  });

  describe('Cas de bordure', () => {
    it.skip('devrait gérer plusieurs filtres sans erreur', async () => {});
  });
});
