import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SelectionModal from '@components/SelectionModal';
import { useAppTheme } from '@theme/useAppTheme';

jest.mock('@theme/useAppTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock(
  'react-native',
  () => {
    const React = require('react');
    return {
      View: 'View',
      Text: 'Text',
      TouchableOpacity: 'TouchableOpacity',
      TouchableWithoutFeedback: 'TouchableWithoutFeedback',
      TextInput: 'TextInput',
      Modal: ({ visible, children }: any) =>
        visible
          ? React.createElement('View', { testID: 'modal-view' }, children)
          : null,
      FlatList: ({ data, renderItem, keyExtractor, ListEmptyComponent }: any) =>
        React.createElement(
          'View',
          { testID: 'flat-list' },
          data && data.length
            ? data.map((item: any, index: number) => {
                const key = keyExtractor
                  ? keyExtractor(item, index)
                  : item.id ?? index;
                return React.createElement(
                  'View',
                  { key },
                  renderItem({ item, index }),
                );
              })
            : React.createElement(
                'View',
                { testID: 'empty-list' },
                ListEmptyComponent && React.createElement(ListEmptyComponent),
              ),
        ),
      ActivityIndicator: 'ActivityIndicator',
      StyleSheet: {
        create: jest.fn(() => ({})),
      },
      Platform: {
        OS: 'ios',
        select: (obj: any) => obj.ios || obj.default,
      },
    };
  },
  { virtual: true },
);

const mockTheme = {
  theme: {
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      inputBackground: '#F5F5F5',
      inputBorder: '#E0E0E0',
      primary: '#007AFF',
      placeholder: '#999999',
    },
    spacing: { md: 12, sm: 8, lg: 16, xl: 20 },
    radius: { md: 8, lg: 12 },
  },
};

(useAppTheme as jest.Mock).mockReturnValue(mockTheme);

describe('SelectionModal', () => {
  const items = [
    { id: '1', label: 'Orange' },
    { id: '2', label: 'Banane' },
  ];

  it('n’affiche pas le modal quand visible est false', () => {
    let instance: any;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <SelectionModal
          visible={false}
          onClose={jest.fn()}
          onSelect={jest.fn()}
          data={items}
        />,
      );
    });

    expect(instance.root.findAllByProps({ testID: 'modal-view' })).toHaveLength(
      0,
    );
  });

  it('affiche le modal et la liste des éléments quand visible est true', () => {
    let instance: any;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <SelectionModal
          visible
          onClose={jest.fn()}
          onSelect={jest.fn()}
          data={items}
          title="Sélectionner une couleur"
        />,
      );
    });

    const title = instance.root.findByProps({
      testID: 'selection-modal-title',
    });
    const itemButton = instance.root.findByProps({
      testID: 'selection-item-1',
    });

    expect(instance.root.findAllByProps({ testID: 'modal-view' })).toHaveLength(
      1,
    );
    expect(title.props.children).toBe('Sélectionner une couleur');
    expect(itemButton).toBeDefined();
  });

  it('filtre la liste en fonction du texte saisi', () => {
    let instance: any;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <SelectionModal
          visible
          onClose={jest.fn()}
          onSelect={jest.fn()}
          data={items}
        />,
      );
    });

    const input = instance.root.findByType('TextInput');
    ReactTestRenderer.act(() => {
      input.props.onChangeText('Banane');
    });

    const bananeButton = instance.root.findAllByProps({
      testID: 'selection-item-2',
    });
    const orangeButton = instance.root.findAllByProps({
      testID: 'selection-item-1',
    });

    expect(bananeButton).toHaveLength(1);
    expect(orangeButton).toHaveLength(0);
  });

  it('appelle onSelect et onClose lorsque l’élément est sélectionné', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    let instance: any;

    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <SelectionModal
          visible
          onClose={onClose}
          onSelect={onSelect}
          data={items}
        />,
      );
    });

    const itemButton = instance.root.findByProps({
      testID: 'selection-item-1',
    });

    expect(itemButton).toBeDefined();

    ReactTestRenderer.act(() => {
      itemButton.props.onPress();
    });

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining(items[0]));
    expect(onClose).toHaveBeenCalled();
  });

  it('affiche le message vide quand aucun élément ne correspond', () => {
    let instance: any;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <SelectionModal
          visible
          onClose={jest.fn()}
          onSelect={jest.fn()}
          data={items}
          emptyMessage="Aucun résultat"
        />,
      );
    });

    const input = instance.root.findByType('TextInput');
    ReactTestRenderer.act(() => {
      input.props.onChangeText('Rien');
    });

    const emptyViews = instance.root.findAllByProps({ testID: 'empty-list' });
    expect(emptyViews).toHaveLength(1);

    const emptyMessage = instance.root.findByProps({
      testID: 'selection-empty-message',
    });
    expect(emptyMessage.props.children).toBe('Aucun résultat');
  });

  it('affiche un ActivityIndicator quand loading est true', () => {
    let instance: any;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <SelectionModal
          visible
          onClose={jest.fn()}
          onSelect={jest.fn()}
          data={[]}
          loading
        />,
      );
    });

    const activityIndicators = instance.root.findAllByType('ActivityIndicator');
    expect(activityIndicators).toHaveLength(1);
  });
});
