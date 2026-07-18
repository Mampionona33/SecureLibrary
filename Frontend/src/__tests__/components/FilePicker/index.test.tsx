import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import FilePicker from '@components/FilePicker';
import { useAppTheme } from '@theme/useAppTheme';

// Mocks
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: { create: jest.fn(() => ({})) },
    Alert: { alert: jest.fn() },
    TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
    NativeModules: { DevMenu: null },
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  };
}, { virtual: true });

jest.mock('react-native-document-picker', () => ({
  pickSingle: jest.fn(),
  types: { pdf: 'application/pdf' },
  isCancel: jest.fn(),
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock des styles pour éviter les erreurs
jest.mock('@components/FilePicker/styles', () => ({
  styles: {
    label: {},
    filePickerButton: {},
    filePickerText: {},
  },
}));

// ==================== TEST SETUP ====================

const mockTheme = {
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
};

(useAppTheme as jest.Mock).mockReturnValue(mockTheme);

const mockOnFileSelected = jest.fn();

// ==================== HELPERS ====================

const findByTestID = (root: any, testID: string) => {
  const elements = root.findAll((el: any) => el.props.testID === testID);
  return elements.length > 0 ? elements[0] : null;
};

const press = (element: any) => {
  element.props.onPress();
};

// ==================== TESTS ====================

describe('FilePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnFileSelected.mockReset();
    Alert.alert = jest.fn();
    (DocumentPicker.isCancel as jest.Mock).mockReturnValue(false);
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le libellé par défaut', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />
        );
      });
      const root = instance.root;
      const label = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === 'Fichier PDF'
      );
      expect(label).toBeDefined();
    });

    it('devrait afficher un libellé personnalisé', async () => {
      const customLabel = 'Document PDF';
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} label={customLabel} />
        );
      });
      const root = instance.root;
      const label = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === customLabel
      );
      expect(label).toBeDefined();
    });

    it('devrait afficher le placeholder par défaut', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />
        );
      });
      const root = instance.root;
      const placeholder = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === 'Choisir un fichier PDF'
      );
      expect(placeholder).toBeDefined();
    });

    it('devrait afficher un placeholder personnalisé', async () => {
      const customPlaceholder = 'Sélectionner un PDF';
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} placeholder={customPlaceholder} />
        );
      });
      const root = instance.root;
      const placeholder = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === customPlaceholder
      );
      expect(placeholder).toBeDefined();
    });

    it('devrait afficher le nom du fichier sélectionné', async () => {
      const selectedFile = { uri: 'file://test.pdf', name: 'document.pdf' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} selectedFile={selectedFile} />
        );
      });
      const root = instance.root;
      const fileName = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === 'document.pdf'
      );
      expect(fileName).toBeDefined();
    });

    it('devrait afficher le bouton de suppression si un fichier est sélectionné', async () => {
      const selectedFile = { uri: 'file://test.pdf', name: 'document.pdf' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} selectedFile={selectedFile} />
        );
      });
      const root = instance.root;
      const clearButton = findByTestID(root, 'file-picker-clear');
      expect(clearButton).toBeDefined();
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions', () => {
    it('devrait appeler DocumentPicker.pickSingle lors du clic sur le bouton', async () => {
      (DocumentPicker.pickSingle as jest.Mock).mockResolvedValue({
        uri: 'file://test.pdf',
        name: 'document.pdf',
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'file-picker');
      expect(pickerButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
        // Attendre la résolution de la promesse
        await Promise.resolve();
      });

      expect(DocumentPicker.pickSingle).toHaveBeenCalledWith({
        type: [DocumentPicker.types.pdf],
        presentationStyle: 'fullScreen',
      });
    });

    it('devrait appeler onFileSelected avec le fichier sélectionné', async () => {
      const mockFile = { uri: 'file://test.pdf', name: 'document.pdf' };
      (DocumentPicker.pickSingle as jest.Mock).mockResolvedValue(mockFile);

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'file-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
        await Promise.resolve();
      });

      expect(mockOnFileSelected).toHaveBeenCalledWith({
        uri: mockFile.uri,
        name: mockFile.name,
      });
    });

    it('devrait gérer l\'annulation de la sélection', async () => {
      (DocumentPicker.pickSingle as jest.Mock).mockRejectedValue(new Error('User cancelled'));
      (DocumentPicker.isCancel as jest.Mock).mockReturnValue(true);

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'file-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
        await Promise.resolve();
      });

      expect(mockOnFileSelected).not.toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('devrait afficher une alerte en cas d\'erreur de sélection', async () => {
      const error = new Error('Permission denied');
      (DocumentPicker.pickSingle as jest.Mock).mockRejectedValue(error);
      (DocumentPicker.isCancel as jest.Mock).mockReturnValue(false);

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'file-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
        await Promise.resolve();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de sélectionner le fichier PDF.');
    });

    it('devrait appeler onFileSelected avec null lors du clic sur le bouton de suppression', async () => {
      const selectedFile = { uri: 'file://test.pdf', name: 'document.pdf' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} selectedFile={selectedFile} />
        );
      });
      const root = instance.root;
      const clearButton = findByTestID(root, 'file-picker-clear');
      expect(clearButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        press(clearButton);
      });

      expect(mockOnFileSelected).toHaveBeenCalledWith(null);
    });
  });
});
