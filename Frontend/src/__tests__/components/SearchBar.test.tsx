// __tests__/components/SearchBar.test.tsx
import React from 'react';
import TestRenderer, { ReactTestRenderer } from 'react-test-renderer';
import { SearchBar } from '@components/SearchBar';
import { TextInput, TouchableOpacity, Text, View } from 'react-native';

// Mocks
jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: () => ({
    theme: {
      colors: {
        surface: '#FFFFFF',
        border: '#E0E0E0',
        text: '#000000',
        placeholder: '#999999',
        textMuted: '#666666',
      },
      spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
      radius: { sm: 4, md: 8, lg: 12, xl: 16 },
    },
  }),
}));

jest.mock('@components/SearchBar/styles', () => ({
  styles: {
    container: {},
    searchWrapper: {},
    icon: {},
    input: {},
    clearButton: {},
    clearText: {},
  },
}));

// Mock des composants React Native
jest.mock('react-native', () => ({
  Text: 'Text',
  View: 'View',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  StyleSheet: {
    create: jest.fn(() => ({})),
  },
}), { virtual: true });

describe('SearchBar', () => {
  
  it('renders correctly with default props', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="" onChangeText={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      
      // Vérifier que TextInput existe avec le bon placeholder
      const textInputs = testInstance.findAllByType(TextInput);
      expect(textInputs.length).toBe(1);
      expect(textInputs[0].props.placeholder).toBe('Rechercher...');
      
      // Vérifier que l'icône de recherche existe
      const texts = testInstance.findAllByType(Text);
      const hasSearchIcon = texts.some(text => text.props.children === '🔍');
      expect(hasSearchIcon).toBe(true);
    }
  });

  it('renders with custom placeholder', () => {
    const customPlaceholder = 'Search users...';
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="" onChangeText={() => {}} placeholder={customPlaceholder} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const textInputs = testInstance.findAllByType(TextInput);
      expect(textInputs.length).toBe(1);
      expect(textInputs[0].props.placeholder).toBe(customPlaceholder);
    }
  });

  it('displays the correct value in TextInput', () => {
    const testValue = 'Test search query';
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value={testValue} onChangeText={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const textInputs = testInstance.findAllByType(TextInput);
      expect(textInputs.length).toBe(1);
      expect(textInputs[0].props.value).toBe(testValue);
    }
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const textInputs = testInstance.findAllByType(TextInput);
      
      TestRenderer.act(() => {
        textInputs[0].props.onChangeText('Test search query');
      });
      
      expect(mockOnChangeText).toHaveBeenCalledWith('Test search query');
      expect(mockOnChangeText).toHaveBeenCalledTimes(1);
    }
  });

  it('shows clear button when value is not empty', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="test" onChangeText={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const touchables = testInstance.findAllByType(TouchableOpacity);
      expect(touchables.length).toBe(1);
      
      // Vérifier que le texte ✕ est présent
      const texts = testInstance.findAllByType(Text);
      const hasClearIcon = texts.some(text => text.props.children === '✕');
      expect(hasClearIcon).toBe(true);
    }
  });

  it('does not show clear button when value is empty', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="" onChangeText={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const touchables = testInstance.findAllByType(TouchableOpacity);
      expect(touchables.length).toBe(0);
      
      // Vérifier que le texte ✕ n'est pas présent
      const texts = testInstance.findAllByType(Text);
      const hasClearIcon = texts.some(text => text.props.children === '✕');
      expect(hasClearIcon).toBe(false);
    }
  });

  it('calls onChangeText with empty string when clear button is pressed', () => {
    const mockOnChangeText = jest.fn();
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="Test search query" onChangeText={mockOnChangeText} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const touchables = testInstance.findAllByType(TouchableOpacity);
      expect(touchables.length).toBe(1);
      
      TestRenderer.act(() => {
        touchables[0].props.onPress();
      });
      
      expect(mockOnChangeText).toHaveBeenCalledWith('');
      expect(mockOnChangeText).toHaveBeenCalledTimes(1);
    }
  });

  it('has correct autoCorrect and autoCapitalize props', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="" onChangeText={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const textInputs = testInstance.findAllByType(TextInput);
      expect(textInputs[0].props.autoCorrect).toBe(false);
      expect(textInputs[0].props.autoCapitalize).toBe('none');
    }
  });

  it('clear button has proper hitSlop for better touch targets', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="test" onChangeText={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const touchables = testInstance.findAllByType(TouchableOpacity);
      expect(touchables.length).toBe(1);
      expect(touchables[0].props.hitSlop).toEqual({
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      });
    }
  });

  it('applies theme styles correctly', () => {
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="" onChangeText={() => {}} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const textInputs = testInstance.findAllByType(TextInput);
      expect(textInputs[0].props.style).toBeDefined();
    }
  });

  it('handles rapid text changes correctly', () => {
    const mockOnChangeText = jest.fn();
    const testTexts = ['a', 'ab', 'abc', 'abcd'];
    let renderer: ReactTestRenderer | null = null;
    
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );
    });

    expect(renderer).not.toBeNull();
    
    if (renderer) {
      const testInstance = renderer.root;
      const textInputs = testInstance.findAllByType(TextInput);
      
      testTexts.forEach(text => {
        TestRenderer.act(() => {
          textInputs[0].props.onChangeText(text);
        });
      });
      
      expect(mockOnChangeText).toHaveBeenCalledTimes(testTexts.length);
      expect(mockOnChangeText).toHaveBeenLastCalledWith('abcd');
    }
  });
});
