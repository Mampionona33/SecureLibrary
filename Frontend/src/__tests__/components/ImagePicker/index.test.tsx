import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ImagePicker from '@components/ImagePicker';
import { useAppTheme } from '@theme/useAppTheme';

// ==================== MOCKS ====================

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    Image: 'Image',
    StyleSheet: { create: jest.fn(() => ({})) },
    Alert: { alert: jest.fn() },
    TurboModuleRegistry: { getEnforcing: jest.fn(), get: jest.fn() },
    NativeModules: { DevMenu: null },
    Platform: { OS: 'ios', select: jest.fn((obj) => obj.ios || obj.default) },
  };
}, { virtual: true });

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('@components/ImagePicker/styles', () => ({
  styles: {
    label: {},
    imagePickerButton: {},
    imagePickerText: {},
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

const mockOnImageSelected = jest.fn();

// ==================== HELPERS ====================

const findByTestID = (root: any, testID: string) => {
  const elements = root.findAll((el: any) => el.props.testID === testID);
  return elements.length > 0 ? elements[0] : null;
};

const press = (element: any) => {
  element.props.onPress();
};

// ==================== TESTS ====================

describe('ImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnImageSelected.mockReset();
    Alert.alert = jest.fn();
    (launchImageLibrary as jest.Mock).mockReset();
  });

  // ===== RENDER TESTS =====
  describe('Rendu', () => {
    it('devrait se rendre sans erreur', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} />
        );
      });
      expect(instance).toBeDefined();
      expect(instance.root).toBeDefined();
    });

    it('devrait afficher le libellé par défaut', async () => {
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} />
        );
      });
      const root = instance.root;
      const label = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === 'Image de couverture'
      );
      expect(label).toBeDefined();
    });

    it('devrait afficher un libellé personnalisé', async () => {
      const customLabel = 'Photo de couverture';
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} label={customLabel} />
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
          <ImagePicker onImageSelected={mockOnImageSelected} />
        );
      });
      const root = instance.root;
      const placeholder = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === 'Choisir une image'
      );
      expect(placeholder).toBeDefined();
    });

    it('devrait afficher un placeholder personnalisé', async () => {
      const customPlaceholder = 'Sélectionner une photo';
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} placeholder={customPlaceholder} />
        );
      });
      const root = instance.root;
      const placeholder = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === customPlaceholder
      );
      expect(placeholder).toBeDefined();
    });

    it('devrait afficher l\'image et le nom si une image est sélectionnée', async () => {
      const selectedImage = { uri: 'file://test.jpg', name: 'cover.jpg' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} selectedImage={selectedImage} />
        );
      });
      const root = instance.root;
      const imageComponent = root.findAll((el: any) => el.type === 'Image');
      expect(imageComponent.length).toBeGreaterThan(0);
      const nameText = root.find(
        (el: any) => el.props.children && typeof el.props.children === 'string' && el.props.children === 'cover.jpg'
      );
      expect(nameText).toBeDefined();
    });

    it('devrait afficher le bouton de suppression si une image est sélectionnée', async () => {
      const selectedImage = { uri: 'file://test.jpg', name: 'cover.jpg' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} selectedImage={selectedImage} />
        );
      });
      const root = instance.root;
      const clearButton = findByTestID(root, 'image-picker-clear');
      expect(clearButton).toBeDefined();
    });
  });

  // ===== INTERACTIONS =====
  describe('Interactions', () => {
    it('devrait appeler launchImageLibrary lors du clic sur le bouton', async () => {
      (launchImageLibrary as jest.Mock).mockImplementation((options, callback) => {
        callback({
          assets: [{ uri: 'file://test.jpg', fileName: 'cover.jpg' }],
        });
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} />
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'image-picker');
      expect(pickerButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
      });

      expect(launchImageLibrary).toHaveBeenCalledWith(
        {
          mediaType: 'photo',
          includeBase64: false,
          quality: 0.8,
        },
        expect.any(Function)
      );
    });

    it('devrait appeler onImageSelected avec l\'image sélectionnée', async () => {
      const mockImage = { uri: 'file://test.jpg', fileName: 'cover.jpg' };
      (launchImageLibrary as jest.Mock).mockImplementation((options, callback) => {
        callback({ assets: [mockImage] });
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} />
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'image-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
      });

      expect(mockOnImageSelected).toHaveBeenCalledWith({
        uri: mockImage.uri,
        name: mockImage.fileName,
      });
    });

    it('devrait gérer l\'annulation de la sélection', async () => {
      (launchImageLibrary as jest.Mock).mockImplementation((options, callback) => {
        callback({ didCancel: true });
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} />
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'image-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
      });

      expect(mockOnImageSelected).not.toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('devrait afficher une alerte en cas d\'erreur', async () => {
      const errorMessage = 'Permission denied';
      (launchImageLibrary as jest.Mock).mockImplementation((options, callback) => {
        callback({ errorMessage });
      });

      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} />
        );
      });
      const root = instance.root;
      const pickerButton = findByTestID(root, 'image-picker');

      await ReactTestRenderer.act(async () => {
        press(pickerButton);
      });

      expect(Alert.alert).toHaveBeenCalledWith('Erreur', errorMessage);
    });

    it('devrait appeler onImageSelected avec null lors du clic sur le bouton de suppression', async () => {
      const selectedImage = { uri: 'file://test.jpg', name: 'cover.jpg' };
      let instance: any;
      await ReactTestRenderer.act(async () => {
        instance = ReactTestRenderer.create(
          <ImagePicker onImageSelected={mockOnImageSelected} selectedImage={selectedImage} />
        );
      });
      const root = instance.root;
      const clearButton = findByTestID(root, 'image-picker-clear');
      expect(clearButton).toBeDefined();

      await ReactTestRenderer.act(async () => {
        press(clearButton);
      });

      expect(mockOnImageSelected).toHaveBeenCalledWith(null);
    });
  });
});
