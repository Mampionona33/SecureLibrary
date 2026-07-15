// __tests__/screens/Main/BookReader.test.tsx
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, ActivityIndicator, View } from 'react-native';
import BookReaderScreen from '@screens/Main/BookReader';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCK DATA ====================

const mockRouteParams = {
  bookId: '1',
  title: 'Le Livre',
  fileUrl: 'https://example.com/book.pdf',
};

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

// ==================== MOCKS ====================

jest.mock('@screens/Main/BookReader/styles', () => ({
  styles: {
    safeArea: {},
    header: {},
    backButton: {},
    backButtonText: {},
    bookTitle: {},
    placeholder: {},
    container: {},
    pdf: {},
    centerContainer: {},
    loadingText: {},
    errorText: {},
    footer: {},
    footerText: {},
  },
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@navigation/types', () => ({
  MainStackParamList: {},
}));

// Mock pdfHandler
jest.mock('@screens/Main/BookReader/pdfHandler', () => ({
  preparePDFSource: jest.fn((url, token) => ({ uri: url, headers: { Authorization: `Bearer ${token}` } })),
  calculateReadingProgress: jest.fn((current, total) => Math.round((current / total) * 100)),
}));

// Mock react-native-pdf
jest.mock('react-native-pdf', () => {
  const React = require('react');
  const { View, Text, ActivityIndicator } = require('react-native');
  return ({ testID, onLoadComplete, onPageChanged, onError, renderActivityIndicator, style }) => {
    const [loaded, setLoaded] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setTotal(10);
        setLoaded(true);
        if (onLoadComplete) onLoadComplete(10);
        if (onPageChanged) onPageChanged(1);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    if (!loaded) {
      return renderActivityIndicator ? renderActivityIndicator() : <View testID="pdf-loading"><ActivityIndicator /></View>;
    }

    return (
      <View testID={testID || 'pdf-view'} style={style}>
        <Text testID="pdf-loaded">PDF loaded</Text>
      </View>
    );
  };
}, { virtual: true });

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// ==================== TEST SETUP ====================

(useAppTheme as jest.Mock).mockReturnValue({
  theme: {
    colors: {
      text: '#000',
      textSecondary: '#666',
      background: '#fff',
      primary: '#007AFF',
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

describe('BookReaderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookReaderScreen route={{ params: mockRouteParams, key: 'bookreader', name: 'BookReader' }} navigation={mockNavigation} />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le titre du livre', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookReaderScreen route={{ params: mockRouteParams, key: 'bookreader', name: 'BookReader' }} navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const title = root.find((el: any) => el.props.testID === 'bookreader-title');
      expect(title).toBeDefined();
      expect(title.props.children).toBe('Le Livre');
    });

    it('devrait afficher le bouton de retour', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookReaderScreen route={{ params: mockRouteParams, key: 'bookreader', name: 'BookReader' }} navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const backButton = root.find((el: any) => el.props.testID === 'bookreader-back-button');
      expect(backButton).toBeDefined();
    });

    it('devrait afficher le loader pendant le chargement', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookReaderScreen route={{ params: mockRouteParams, key: 'bookreader', name: 'BookReader' }} navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const loader = root.find((el: any) => el.props.testID === 'bookreader-loader');
      expect(loader).toBeDefined();
    });
  });

  // ===== INTERACTION TESTS =====
  describe('Interactions', () => {
    it('devrait appeler navigation.goBack lors du clic sur le bouton Fermer', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookReaderScreen route={{ params: mockRouteParams, key: 'bookreader', name: 'BookReader' }} navigation={mockNavigation} />
        );
      });
      const root = instance.root;
      const backButton = root.find((el: any) => el.props.testID === 'bookreader-back-button');
      expect(backButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        backButton.props.onPress();
      });
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  // ===== PDF LOADING =====
  describe('Chargement du PDF', () => {
    it('devrait afficher le pied de page avec pagination après chargement', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <BookReaderScreen route={{ params: mockRouteParams, key: 'bookreader', name: 'BookReader' }} navigation={mockNavigation} />
        );
      });
      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(200);
      });

      const root = instance.root;
      const footer = root.find((el: any) => el.props.testID === 'bookreader-footer');
      expect(footer).toBeDefined();

      const pageInfo = root.find((el: any) => el.props.testID === 'bookreader-page-info');
      expect(pageInfo).toBeDefined();
      
      // Vérification du contenu : c'est un tableau ["Page ", 1, " / ", 10]
      const pageChildren = pageInfo.props.children;
      if (Array.isArray(pageChildren)) {
        expect(pageChildren).toEqual(['Page ', 1, ' / ', 10]);
      } else {
        expect(pageChildren).toBe('Page 1 / 10');
      }

      const progress = root.find((el: any) => el.props.testID === 'bookreader-progress');
      expect(progress).toBeDefined();
      
      // Vérification : le texte est un tableau [10, "% lu"]
      const progressChildren = progress.props.children;
      if (Array.isArray(progressChildren)) {
        expect(progressChildren).toEqual([10, '% lu']);
      } else {
        expect(progressChildren).toBe('10% lu');
      }
    });
  });

  // ===== ERROR HANDLING =====
  describe('Gestion d\'erreur', () => {
    // Test correctement placé (pas imbriqué)
    it.skip('devrait afficher un message d\'erreur en cas d\'échec de chargement', () => {});
  });
});
