import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import { pick } from '@react-native-documents/picker';
import FilePicker from '@components/FilePicker';
import { useAppTheme } from '@theme/useAppTheme';

// Mocks
jest.mock(
  'react-native',
  () => {
    const React = require('react');
    return {
      View: 'View',
      Text: 'Text',
      TouchableOpacity: 'TouchableOpacity',
      StyleSheet: { create: jest.fn(() => ({})) },
      Alert: { alert: jest.fn() },
      TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
      NativeModules: { DevMenu: null },
      Platform: { OS: 'ios', select: jest.fn(obj => obj.ios || obj.default) },
    };
  },
  { virtual: true },
);

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
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
    (pick as jest.Mock).mockReset();
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />,
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le libellé par défaut', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />,
        );
      });
      const label = instance.root.findByProps({ testID: 'file-picker-label' });
      expect(label.props.children).toBe('Fichier PDF');
    });

    it('devrait afficher un libellé personnalisé', async () => {
      const customLabel = 'Document PDF';
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker
            onFileSelected={mockOnFileSelected}
            label={customLabel}
          />,
        );
      });
      const root = instance.root;
      const label = root.find(
        (el: any) =>
          el.props.children &&
          typeof el.props.children === 'string' &&
          el.props.children === customLabel,
      );
      expect(label).toBeDefined();
    });

    it('devrait afficher le placeholder par défaut', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />,
        );
      });
      const placeholder = instance.root.findByProps({
        testID: 'file-picker-placeholder',
      });
      expect(placeholder.props.children).toBe('Choisir un fichier PDF');
    });

    it('devrait afficher un placeholder personnalisé', async () => {
      const customPlaceholder = 'Sélectionner un PDF';
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker
            onFileSelected={mockOnFileSelected}
            placeholder={customPlaceholder}
          />,
        );
      });
      const root = instance.root;
      const placeholder = root.find(
        (el: any) =>
          el.props.children &&
          typeof el.props.children === 'string' &&
          el.props.children === customPlaceholder,
      );
      expect(placeholder).toBeDefined();
    });

    it('devrait afficher le nom du fichier sélectionné', async () => {
      const selectedFile = { uri: 'file://test.pdf', name: 'document.pdf' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker
            onFileSelected={mockOnFileSelected}
            selectedFile={selectedFile}
          />,
        );
      });
      const root = instance.root;
      const fileName = root.find(
        (el: any) =>
          el.props.children &&
          typeof el.props.children === 'string' &&
          el.props.children === 'document.pdf',
      );
      expect(fileName).toBeDefined();
    });

    it('devrait afficher le bouton de suppression si un fichier est sélectionné', async () => {
      const selectedFile = { uri: 'file://test.pdf', name: 'document.pdf' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker
            onFileSelected={mockOnFileSelected}
            selectedFile={selectedFile}
          />,
        );
      });
      const root = instance.root;
      const clearButton = findByTestID(root, 'file-picker-clear');
      expect(clearButton).toBeDefined();
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions', () => {
    it('devrait appeler pick lors du clic sur le bouton', async () => {
      (pick as jest.Mock).mockResolvedValue([
        { uri: 'file://test.pdf', name: 'document.pdf' },
      ]);

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />,
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'file-picker');
      expect(pickerButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
        await new Promise(resolve => setTimeout(resolve, 350));
      });

      expect(pick).toHaveBeenCalledWith({
        mode: 'import',
      });
    });

    it('devrait appeler onFileSelected avec le fichier sélectionné', async () => {
      const mockFile = { uri: 'file://test.pdf', name: 'document.pdf' };
      (pick as jest.Mock).mockResolvedValue([mockFile]);

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />,
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'file-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
        await new Promise(resolve => setTimeout(resolve, 350));
      });

      expect(mockOnFileSelected).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockFile.name,
        }),
      );
      expect(mockOnFileSelected.mock.calls[0][0].uri).toContain('document.pdf');
    });

    it("devrait gérer l'annulation de la sélection", async () => {
      (pick as jest.Mock).mockRejectedValue({ code: 'CANCELED' });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />,
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'file-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
        await new Promise(resolve => setTimeout(resolve, 350));
      });

      expect(mockOnFileSelected).not.toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it("devrait afficher une alerte en cas d'erreur de sélection", async () => {
      const error = new Error('Permission denied');
      (pick as jest.Mock).mockRejectedValue(error);

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker onFileSelected={mockOnFileSelected} />,
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'file-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
        await new Promise(resolve => setTimeout(resolve, 350));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de sélectionner le fichier',
      );
    });

    it('devrait appeler onFileSelected avec null lors du clic sur le bouton de suppression', async () => {
      const selectedFile = { uri: 'file://test.pdf', name: 'document.pdf' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <FilePicker
            onFileSelected={mockOnFileSelected}
            selectedFile={selectedFile}
          />,
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
